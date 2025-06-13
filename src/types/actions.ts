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
