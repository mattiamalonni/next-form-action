import { ActionParams, ActionState } from '@/types/actions';

export class ActionResponse extends Error {
  public readonly payload?: FormData;

  public readonly success?: ActionState['success'];

  public readonly formErrors?: ActionState['formErrors'];
  public readonly extra?: ActionState['extra'];

  public readonly redirect?: ActionState['redirect'];
  public readonly refresh?: ActionState['refresh'];

  constructor(message: ActionState['message'], success: ActionState['success'], params: ActionParams = {}) {
    super(message);
    this.success = success;

    this.formErrors = params.formErrors;
    this.extra = params.extra;

    this.redirect = params.redirect;
    this.refresh = params.refresh;
  }

  toResponse(formData?: FormData): ActionState {
    return {
      payload: formData,

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
  constructor(message: ActionState['message'], params: ActionParams = {}) {
    super(message, false, params);
  }
}

export class ActionSuccess extends ActionResponse {
  constructor(message: ActionState['message'], params: ActionParams = {}) {
    super(message, true, params);
  }
}
