import { ActionParams, ActionState } from '@/types/actions';

export class ActionResponse extends Error {
  public readonly payload: FormData;

  public readonly success: ActionState['success'];

  public readonly formErrors?: ActionState['formErrors'];
  public readonly extra?: ActionState['extra'];

  public readonly redirect?: ActionState['redirect'];
  public readonly refresh?: ActionState['refresh'];

  constructor(message: ActionState['message'], success: ActionState['success'], payload: FormData, params: ActionParams = {}) {
    super(message);
    this.payload = payload;

    this.success = success;

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
  constructor(message: ActionState['message'], payload: FormData, params: ActionParams = {}) {
    super(message, false, payload, params);
  }
}

export class ActionSuccess extends ActionResponse {
  constructor(message: ActionState['message'], payload: FormData, params: ActionParams = {}) {
    super(message, true, payload, params);
  }
}
