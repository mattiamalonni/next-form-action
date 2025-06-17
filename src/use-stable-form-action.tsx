'use client';

import React, { PropsWithChildren, useState, useEffect, HTMLAttributes, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createFormActionState } from '@/actions';
import { FormAction, FormActionState } from '@/types/actions';

export const useExperimentalFormAction = (formAction: FormAction) => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<FormActionState>(createFormActionState());
  const [isPending, startTransition] = useTransition();

  // Store single callbacks
  const onSuccessCallbackRef = useRef<((state: FormActionState) => void | Promise<void>) | null>(null);
  const onErrorCallbackRef = useRef<((state: FormActionState) => void | Promise<void>) | null>(null);
  const onSubmitCallbackRef = useRef<((formData: FormData) => void | Promise<void>) | null>(null);

  useEffect(() => {
    // Execute callbacks based on current state
    if (state.success && onSuccessCallbackRef.current) {
      onSuccessCallbackRef.current(state);
      onSuccessCallbackRef.current = null; // Clear after execution
      // Reset form on success
      if (formRef.current) {
        formRef.current.reset();
      }
    } else if (!state.success && state.message && onErrorCallbackRef.current) {
      onErrorCallbackRef.current(state);
      onErrorCallbackRef.current = null; // Clear after execution
    }

    // Handle navigation
    if (state.redirect) router.push(state.redirect);
    if (state.refresh) router.refresh();
  }, [state, router]);

  const FormError: React.FC<HTMLAttributes<HTMLDivElement>> = props => {
    return state.message ? <div {...props}>{state.message}</div> : null;
  };

  const Form: React.FC<HTMLAttributes<HTMLFormElement> & PropsWithChildren> = ({ children, ...props }) => (
    <form {...props} ref={formRef} action={enhancedDispatch}>
      {children}
    </form>
  );

  const onFormSuccess = (callback: (state: FormActionState) => void | Promise<void>) => {
    onSuccessCallbackRef.current = callback;
  };

  const onFormError = (callback: (state: FormActionState) => void | Promise<void>) => {
    onErrorCallbackRef.current = callback;
  };

  const onFormSubmit = (callback: (formData: FormData) => void | Promise<void>) => {
    onSubmitCallbackRef.current = callback;
  };

  const resetForm = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
    setState(createFormActionState());
  };

  const enhancedDispatch = async (formData: FormData) => {
    if (onSubmitCallbackRef.current) {
      await onSubmitCallbackRef.current(formData);
      onSubmitCallbackRef.current = null;
    }

    startTransition(async () => {
      const newState = await formAction(state, formData);
      setState(newState);
    });
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
    resetForm,
  };
};
