'use client';

import React, { PropsWithChildren, useActionState, useEffect, HTMLAttributes, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { createFormActionState } from '@/actions';
import { FormAction, FormActionState } from '@/types/actions';

export const useFormAction = (formAction: FormAction) => {
  const router = useRouter();
  const [state, dispatch, isPending] = useActionState(formAction, createFormActionState());

  // Store callbacks using refs to avoid stale closures
  const successCallbacks = useRef<Array<(state: FormActionState) => void | Promise<void>>>([]);
  const errorCallbacks = useRef<Array<(state: FormActionState) => void | Promise<void>>>([]);

  useEffect(() => {
    const executeCallbacks = async () => {
      if (!state.success) {
        // Execute error callbacks
        for (const callback of errorCallbacks.current) {
          await callback(state);
        }
      } else if (state.success) {
        // Execute success callbacks
        for (const callback of successCallbacks.current) {
          await callback(state);
        }
      }
    };

    executeCallbacks();

    if (state.redirect) router.push(state.redirect);
    if (state.refresh) router.refresh();
  }, [state, router]);

  const FormError: React.FC<HTMLAttributes<HTMLDivElement>> = (...props) => {
    return state.message ? <div {...props}>{state.message}</div> : null;
  };

  const Form: React.FC<HTMLAttributes<HTMLFormElement> & PropsWithChildren> = ({ children, ...props }) => (
    <form {...props} action={dispatch}>
      {children}
    </form>
  );

  // Functions to register callbacks that will be executed automatically based on state
  const onFormSuccess = (callback: (state: FormActionState) => void | Promise<void>) => {
    successCallbacks.current.push(callback);
  };

  const onFormError = (callback: (state: FormActionState) => void | Promise<void>) => {
    errorCallbacks.current.push(callback);
  };

  return {
    Form,
    FormError,
    state,
    isPending,
    onFormSuccess,
    onFormError,
  };
};
