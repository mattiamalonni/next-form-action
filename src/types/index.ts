export type ActionErrorState = {
  success: false;
  message?: string;
  redirect?: string;
  refresh?: boolean;
};

export type ActionSuccessState = {
  success: true;
  message?: string;
  redirect?: string;
  refresh?: boolean;
};

export type ActionState = ActionErrorState | ActionSuccessState;

export type Action<T = unknown> = (data: T) => Promise<ActionState>;

export type ActionParams = Omit<ActionState, "message" | "success">;
