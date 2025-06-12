export type FormActionState = {
  payload?: FormData;

  success: boolean;
  message: string | null;

  formErrors?: Record<string, string[]>;
  extra?: Record<string, unknown>;

  redirect?: string;
  refresh?: boolean;
};

export type FormAction = (state: FormActionState, formData: FormData) => Promise<FormActionState>;
export type FormActionParams = Omit<FormActionState, 'payload' | 'success' | 'message'>;

export const createFormActionState = (payload: FormData, params: FormActionParams = {}): FormActionState => {
  return { ...params, message: null, success: false, payload };
};

export class FormActionResponse {
  public readonly payload: FormData;

  public readonly success: FormActionState['success'];
  public readonly message: FormActionState['message'];

  public readonly formErrors?: FormActionState['formErrors'];
  public readonly extra?: FormActionState['extra'];

  public readonly redirect?: FormActionState['redirect'];
  public readonly refresh?: FormActionState['refresh'];

  constructor(
    payload: FormData,
    success: FormActionState['success'],
    message: FormActionState['message'],
    params: FormActionParams = {},
  ) {
    this.payload = payload;

    this.success = success;
    this.message = message;

    this.formErrors = params.formErrors;
    this.extra = params.extra;

    this.redirect = params.redirect;
    this.refresh = params.refresh;
  }

  toResponse(): FormActionState {
    return {
      payload: this.payload,

      success: this.success,
      message: this.message,

      formErrors: this.formErrors,
      extra: this.extra,

      redirect: this.redirect,
      refresh: this.refresh,
    };
  }
}

export class FormActionError extends FormActionResponse {
  constructor(payload: FormData, message: FormActionState['message'], params: FormActionParams = {}) {
    super(payload, false, message, params);
  }
}

export class FormActionSuccess extends FormActionResponse {
  constructor(payload: FormData, message: FormActionState['message'], params: FormActionParams = {}) {
    super(payload, true, message, params);
  }
}

const throwFormActionError = (
  payload: FormData,
  message: FormActionState['message'],
  params: FormActionParams = {},
) => {
  throw new FormActionError(payload, message, params);
};

const throwFormActionSuccess = (
  payload: FormData,
  message: FormActionState['message'],
  params: FormActionParams = {},
) => {
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
      const formActionError = (message: FormActionState['message'], params: FormActionParams = {}) =>
        throwFormActionError(formData, message, params);

      const formActionSuccess = (message: FormActionState['message'], params: FormActionParams = {}) =>
        throwFormActionSuccess(formData, message, params);

      return await actionFn(state, formData, formActionError, formActionSuccess);
    } catch (error) {
      if (error instanceof FormActionResponse) {
        return error.toResponse();
      }
      console.error(`Error in form action "${context}":`, error);
      return new FormActionError(formData, 'An unexpected error occurred. Please try again.').toResponse();
    }
  };
};

export const defaultFormActionState = createFormActionState(new FormData());
