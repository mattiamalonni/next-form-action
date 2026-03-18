import { ActionErrorState, ActionParams, ActionState, ActionSuccessState } from '@/types';

/**
 * Base class for action responses
 */
class ActionResponse extends Error {
  public readonly state: ActionErrorState | ActionSuccessState;

  constructor(state: ActionErrorState | ActionSuccessState) {
    super(state.message);
    this.state = state;
  }
}

/**
 * Error response - thrown to return error state
 */
class ActionError extends ActionResponse {
  constructor(state: ActionErrorState) {
    super(state);
  }
}

/**
 * Success response - thrown to return success state
 */
class ActionSuccess extends ActionResponse {
  constructor(state: ActionSuccessState) {
    super(state);
  }
}

/**
 * Type guard to detect Next.js system errors (redirect, notFound, etc.)
 * These errors have a digest property that starts with 'NEXT_'
 */
function isNextSystemError(error: unknown): error is Error & { digest: string } {
  return error instanceof Error && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_');
}

/**
 * Throw to return an error state from a server action
 */
export function error(message: ActionState['message'], params: ActionParams = {}): never {
  throw new ActionError({ success: false, message, ...params });
}

/**
 * Throw to return a success state from a server action
 */
export function success(message: ActionState['message'], params: ActionParams = {}): never {
  throw new ActionSuccess({ success: true, message, ...params });
}

/**
 * Wraps a server action handler with error handling and state management
 */
export function createAction<T = unknown>(handler: (data: T) => Promise<ActionState>, context?: string) {
  return async (data: T): Promise<ActionState> => {
    try {
      return await handler(data);
    } catch (caughtError) {
      if (caughtError instanceof ActionResponse) {
        return caughtError.state;
      }

      // Re-throw Next.js system errors (redirect, notFound, etc.)
      if (isNextSystemError(caughtError)) {
        throw caughtError;
      }

      console.error(`Error in action${context ? ` "${context}"` : ''}:`, caughtError);

      const message = caughtError instanceof Error && caughtError.message ? caughtError.message : 'An unexpected error occurred. Please try again.';

      return new ActionError({ success: false, message }).state;
    }
  };
}
