'use client';

import React, { PropsWithChildren, useActionState, useEffect, HTMLAttributes, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { createActionState } from '@/actions';
import { Action, ActionState } from '@/types';

export const useAction = (action: Action, actionState?: ActionState) => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, dispatch, isPending] = useActionState(action, actionState || createActionState());

  // Store single callbacks
  const onSuccessCallbackRef = useRef<((state: ActionState) => void | Promise<void>) | null>(null);
  const onErrorCallbackRef = useRef<((state: ActionState) => void | Promise<void>) | null>(null);
  const onSubmitCallbackRef = useRef<((formData: FormData) => void | Promise<void>) | null>(null);

  useEffect(() => {
    // Execute callbacks based on current state
    if (state.success === true && onSuccessCallbackRef.current) {
      onSuccessCallbackRef.current(state);
      onSuccessCallbackRef.current = null;
    } else if (state.success === false && state.message && onErrorCallbackRef.current) {
      onErrorCallbackRef.current(state);
      onErrorCallbackRef.current = null;
    }

    // Handle navigation
    if (state.redirect) router.push(state.redirect);
    if (state.refresh) router.refresh();
  }, [state, router]);

  const FormError: React.FC<HTMLAttributes<HTMLDivElement>> = (...props) => {
    return state.message ? <div {...props}>{state.message}</div> : null;
  };

  const Form: React.FC<HTMLAttributes<HTMLFormElement> & PropsWithChildren> = ({ children, ...props }) => (
    <form {...props} ref={formRef} action={enhancedDispatch}>
      {children}
    </form>
  );

  const onFormSuccess = (callback: (state: ActionState) => void | Promise<void>) => {
    onSuccessCallbackRef.current = callback;
  };

  const onFormError = (callback: (state: ActionState) => void | Promise<void>) => {
    onErrorCallbackRef.current = callback;
  };

  const onFormSubmit = (callback: (formData: FormData) => void | Promise<void>) => {
    onSubmitCallbackRef.current = callback;
  };

  const enhancedDispatch = async (formData: FormData) => {
    if (onSubmitCallbackRef.current) {
      await onSubmitCallbackRef.current(formData);
      onSubmitCallbackRef.current = null;
    }

    dispatch(formData);
  };

  return {
    Form,
    FormError,
    state,
    isPending,
    formRef,
    onFormSuccess,
    onFormError,
    onFormSubmit,
  };
};
