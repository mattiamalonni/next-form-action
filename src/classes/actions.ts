import { ActionParams, ActionState } from '@/types/actions';

export class ActionResponse {
  public readonly payload: FormData;

  public readonly success: ActionState['success'];
  public readonly message: ActionState['message'];

  public readonly formErrors?: ActionState['formErrors'];
  public readonly extra?: ActionState['extra'];

  public readonly redirect?: ActionState['redirect'];
  public readonly refresh?: ActionState['refresh'];

  constructor(payload: FormData, success: ActionState['success'], message: ActionState['message'], params: ActionParams = {}) {
    this.payload = payload;

    this.success = success;
    this.message = message;

    this.formErrors = params.formErrors;
    this.extra = params.extra;

    this.redirect = params.redirect;
    this.refresh = params.refresh;
  }

  toResponse(): ActionState {
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

export class ActionError extends ActionResponse {
  constructor(payload: FormData, message: ActionState['message'], params: ActionParams = {}) {
    super(payload, false, message, params);
  }
}

export class ActionSuccess extends ActionResponse {
  constructor(payload: FormData, message: ActionState['message'], params: ActionParams = {}) {
    super(payload, true, message, params);
  }
}
