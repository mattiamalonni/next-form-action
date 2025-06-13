import { FormActionParams, FormActionState } from '@/types/actions';

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
