'use client';

import { useActionState, useEffect, useRef } from 'react';
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
    const executeCallback = async () => {
      if (state.success === true && onSuccessCallbackRef.current) {
        await onSuccessCallbackRef.current(state);
        onSuccessCallbackRef.current = null;
      } else if (state.success === false && state.message && onErrorCallbackRef.current) {
        await onErrorCallbackRef.current(state);
        onErrorCallbackRef.current = null;
      }
    };

    executeCallback();

    if (state.redirect) router.push(state.redirect);
    if (state.refresh) router.refresh();
  }, [state, router]);

  const onSuccess = (callback: (state: ActionState) => void | Promise<void>) => {
    onSuccessCallbackRef.current = callback;
  };

  const onError = (callback: (state: ActionState) => void | Promise<void>) => {
    onErrorCallbackRef.current = callback;
  };

  const onSubmit = (callback: (formData: FormData) => void | Promise<void>) => {
    onSubmitCallbackRef.current = callback;
  };

  const wrappedDispatch = async (formData: FormData) => {
    if (onSubmitCallbackRef.current) {
      await onSubmitCallbackRef.current(formData);
      onSubmitCallbackRef.current = null;
    }
    return dispatch(formData);
  };

  return {
    dispatch: wrappedDispatch,
    state,
    isPending,
    formRef,
    onSuccess,
    onError,
    onSubmit,
  };
};
