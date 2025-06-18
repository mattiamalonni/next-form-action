import { ActionParams, ActionState } from '@/types/actions';
import { ActionResponse, ActionError, ActionSuccess } from '@/classes/actions';

export const createActionState = (payload: FormData = new FormData(), params: ActionParams = {}): ActionState => {
  return { ...params, payload };
};

export const createAction = (
  context: string,
  handler: (
    state: ActionState,
    formData: FormData,
    error: (message: ActionState['message'], params?: ActionParams) => never,
    success: (message: ActionState['message'], params?: ActionParams) => never,
  ) => Promise<ActionState>,
): ((state: ActionState, formData: FormData) => Promise<ActionState>) => {
  return async (state: ActionState, formData: FormData): Promise<ActionState> => {
    try {
      function error(message: ActionState['message'], params?: ActionParams): never {
        throw new ActionError(message, formData, params);
      }
      function success(message: ActionState['message'], params?: ActionParams): never {
        throw new ActionSuccess(message, formData, params);
      }

      return await handler(state, formData, error, success);
    } catch (error) {
      if (error instanceof ActionResponse) {
        return error.toResponse();
      }

      // Re-throw Next.js system errors (redirect, notFound, etc.)
      if (error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_')) {
        throw error;
      }

      console.error(`Error in form action "${context}":`, error);
      return new ActionError('An unexpected error occurred. Please try again.', formData).toResponse();
    }
  };
};
