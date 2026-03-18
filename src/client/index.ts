'use client';

import { Action, ActionErrorState, ActionState, ActionSuccessState } from '@/types';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export interface UseActionOptions {
  onSuccess?: (state: ActionState & { success: true }) => void | Promise<void>;
  onError?: (state: ActionState & { success: false }) => void | Promise<void>;
}

/**
 * Hook to use a server action with automatic state management
 */
export function useAction<T = unknown>(action: Action<T>, options: UseActionOptions = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState | undefined>();

  const dispatch = (data?: T) => {
    startTransition(async () => {
      const result = await action(data as T);
      setState(result);

      // Execute callbacks based on state
      if (result.success === true && options.onSuccess) {
        await options.onSuccess(result as ActionSuccessState);
      } else if (result.success === false && options.onError) {
        await options.onError(result as ActionErrorState);
      }

      // Handle implicit actions
      if (result.redirect) {
        router.push(result.redirect);
      }
      if (result.refresh) {
        router.refresh();
      }
    });
  };

  return {
    dispatch,
    state,
    isPending,
  };
}
