import { ActionParams, ActionState } from '@/types/actions';
import { ActionResponse, ActionError, ActionSuccess } from '@/classes/actions';

export const createActionState = (payload: FormData = new FormData(), params: ActionParams = {}): ActionState => {
  return { ...params, message: null, success: false, payload };
};

const throwActionError = (payload: FormData, message: ActionState['message'], params: ActionParams = {}) => {
  throw new ActionError(payload, message, params);
};

const throwActionSuccess = (payload: FormData, message: ActionState['message'], params: ActionParams = {}) => {
  throw new ActionSuccess(payload, message, params);
};

export const createAction = (
  context: string,
  actionFn: (
    state: ActionState,
    formData: FormData,
    error: (message: ActionState['message'], params?: ActionParams) => never,
    success: (message: ActionState['message'], params?: ActionParams) => never,
  ) => Promise<ActionState>,
): ((state: ActionState, formData: FormData) => Promise<ActionState>) => {
  return async (state: ActionState, formData: FormData): Promise<ActionState> => {
    try {
      const error = (message: ActionState['message'], params: ActionParams = {}) => throwActionError(formData, message, params);

      const success = (message: ActionState['message'], params: ActionParams = {}) => throwActionSuccess(formData, message, params);

      return await actionFn(state, formData, error, success);
    } catch (error) {
      if (error instanceof ActionResponse) {
        return error.toResponse();
      }

      // Re-throw Next.js system errors (redirect, notFound, etc.)
      if (error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_')) {
        throw error;
      }

      console.error(`Error in form action "${context}":`, error);
      return new ActionError(formData, 'An unexpected error occurred. Please try again.').toResponse();
    }
  };
};
