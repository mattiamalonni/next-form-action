export type ActionState = {
  payload?: FormData;

  success: boolean;
  message: string | null;

  formErrors?: Record<string, string[]>;
  extra?: Record<string, unknown>;

  redirect?: string;
  refresh?: boolean;
};

export type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

export type ActionParams = Omit<ActionState, 'payload' | 'success' | 'message'>;
