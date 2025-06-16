import { FormActionParams, FormActionState } from '@/types/actions';
import { FormActionResponse, FormActionError, FormActionSuccess } from '@/classes/actions';

export const createFormActionState = (payload: FormData = new FormData(), params: FormActionParams = {}): FormActionState => {
  return { ...params, message: null, success: false, payload };
};

const throwFormActionError = (payload: FormData, message: FormActionState['message'], params: FormActionParams = {}) => {
  throw new FormActionError(payload, message, params);
};

const throwFormActionSuccess = (payload: FormData, message: FormActionState['message'], params: FormActionParams = {}) => {
  throw new FormActionSuccess(payload, message, params);
};

export const createFormAction = (
  context: string,
  actionFn: (
    state: FormActionState,
    formData: FormData,
    formActionError: (message: FormActionState['message'], params?: FormActionParams) => never,
    formActionSuccess: (message: FormActionState['message'], params?: FormActionParams) => never,
  ) => Promise<FormActionState>,
): ((state: FormActionState, formData: FormData) => Promise<FormActionState>) => {
  return async (state: FormActionState, formData: FormData): Promise<FormActionState> => {
    try {
      const error = (message: FormActionState['message'], params: FormActionParams = {}) => throwFormActionError(formData, message, params);

      const success = (message: FormActionState['message'], params: FormActionParams = {}) => throwFormActionSuccess(formData, message, params);

      return await actionFn(state, formData, error, success);
    } catch (error) {
      if (error instanceof FormActionResponse) {
        return error.toResponse();
      }

      // Re-throw Next.js system errors (redirect, notFound, etc.)
      if (error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_')) {
        throw error;
      }

      console.error(`Error in form action "${context}":`, error);
      return new FormActionError(formData, 'An unexpected error occurred. Please try again.').toResponse();
    }
  };
};
