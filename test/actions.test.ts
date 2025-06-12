import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createFormActionState,
  FormActionResponse,
  FormActionError,
  FormActionSuccess,
  createFormAction,
  defaultFormActionState,
} from '@/actions';

describe('Actions', () => {
  let mockFormData: FormData;

  beforeEach(() => {
    mockFormData = new FormData();
    mockFormData.append('email', 'test@example.com');
    mockFormData.append('password', 'password123');
    vi.clearAllMocks();
  });

  describe('createFormActionState', () => {
    it('should create a form action state with default values', () => {
      const state = createFormActionState(mockFormData);

      expect(state).toEqual({
        payload: mockFormData,
        success: false,
        message: null,
      });
    });

    it('should create a form action state with custom parameters', () => {
      const params = {
        formErrors: { email: ['Invalid email'] },
        extra: { userId: 123 },
        redirect: '/dashboard',
        refresh: true,
      };

      const state = createFormActionState(mockFormData, params);

      expect(state).toEqual({
        payload: mockFormData,
        success: false,
        message: null,
        formErrors: { email: ['Invalid email'] },
        extra: { userId: 123 },
        redirect: '/dashboard',
        refresh: true,
      });
    });
  });

  describe('FormActionResponse', () => {
    it('should create a response with all properties', () => {
      const params = {
        formErrors: { field: ['error'] },
        extra: { data: 'test' },
        redirect: '/test',
        refresh: true,
      };

      const response = new FormActionResponse(mockFormData, true, 'Success!', params);

      expect(response.payload).toBe(mockFormData);
      expect(response.success).toBe(true);
      expect(response.message).toBe('Success!');
      expect(response.formErrors).toEqual({ field: ['error'] });
      expect(response.extra).toEqual({ data: 'test' });
      expect(response.redirect).toBe('/test');
      expect(response.refresh).toBe(true);
    });

    it('should convert to FormActionState format', () => {
      const response = new FormActionResponse(mockFormData, false, 'Error occurred');
      const state = response.toResponse();

      expect(state).toEqual({
        payload: mockFormData,
        success: false,
        message: 'Error occurred',
        formErrors: undefined,
        extra: undefined,
        redirect: undefined,
        refresh: undefined,
      });
    });
  });

  describe('FormActionError', () => {
    it('should create an error response', () => {
      const error = new FormActionError(mockFormData, 'Something went wrong');

      expect(error.success).toBe(false);
      expect(error.message).toBe('Something went wrong');
      expect(error.payload).toBe(mockFormData);
    });

    it('should create an error response with parameters', () => {
      const params = {
        formErrors: { email: ['Invalid format'] },
        extra: { code: 400 },
      };

      const error = new FormActionError(mockFormData, 'Validation failed', params);

      expect(error.success).toBe(false);
      expect(error.message).toBe('Validation failed');
      expect(error.formErrors).toEqual({ email: ['Invalid format'] });
      expect(error.extra).toEqual({ code: 400 });
    });
  });

  describe('FormActionSuccess', () => {
    it('should create a success response', () => {
      const success = new FormActionSuccess(mockFormData, 'Operation completed');

      expect(success.success).toBe(true);
      expect(success.message).toBe('Operation completed');
      expect(success.payload).toBe(mockFormData);
    });

    it('should create a success response with redirect', () => {
      const params = {
        redirect: '/success-page',
        extra: { id: 456 },
      };

      const success = new FormActionSuccess(mockFormData, 'Created successfully', params);

      expect(success.success).toBe(true);
      expect(success.message).toBe('Created successfully');
      expect(success.redirect).toBe('/success-page');
      expect(success.extra).toEqual({ id: 456 });
    });
  });

  describe('createFormAction', () => {
    it('should create a form action that handles success', async () => {
      const mockAction = vi.fn(async (state, formData, error, success) => {
        success('Action completed successfully');
        return state; // Won't execute, but satisfies TypeScript
      }) as any;

      const formAction = createFormAction('test-action', mockAction);
      const initialState = createFormActionState(mockFormData);

      const result = await formAction(initialState, mockFormData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Action completed successfully');
      expect(result.payload).toBe(mockFormData);
    });

    it('should create a form action that handles errors', async () => {
      const mockAction = vi.fn(async (state, formData, error, _success) => {
        error('Something went wrong');
        return state; // Won't execute, but satisfies TypeScript
      }) as any;

      const formAction = createFormAction('test-action', mockAction);
      const initialState = createFormActionState(mockFormData);

      const result = await formAction(initialState, mockFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Something went wrong');
      expect(result.payload).toBe(mockFormData);
    });

    it('should handle unexpected errors', async () => {
      const mockAction = vi.fn(async () => {
        throw new Error('Unexpected error');
      });

      // Mock console.error to avoid output during tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const formAction = createFormAction('test-action', mockAction);
      const initialState = createFormActionState(mockFormData);

      const result = await formAction(initialState, mockFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('An unexpected error occurred. Please try again.');
      expect(consoleSpy).toHaveBeenCalledWith('Error in form action "test-action":', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should pass correct parameters to action function', async () => {
      const mockAction = vi.fn(async (state, formData, error, success) => {
        expect(state).toEqual(
          expect.objectContaining({
            success: false,
            message: null,
            payload: mockFormData,
          }),
        );
        expect(formData).toBe(mockFormData);
        expect(typeof error).toBe('function');
        expect(typeof success).toBe('function');

        success('Test completed');
        return state; // Won't execute, but satisfies TypeScript
      }) as any;

      const formAction = createFormAction('test-action', mockAction);
      const initialState = createFormActionState(mockFormData);

      await formAction(initialState, mockFormData);

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should handle success with additional parameters', async () => {
      const mockAction = vi.fn(async (state, formData, error, success) => {
        success('Success with redirect', {
          redirect: '/dashboard',
          extra: { userId: 123 },
        });
        return state; // Won't execute, but satisfies TypeScript
      }) as any;

      const formAction = createFormAction('test-action', mockAction);
      const initialState = createFormActionState(mockFormData);

      const result = await formAction(initialState, mockFormData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Success with redirect');
      expect(result.redirect).toBe('/dashboard');
      expect(result.extra).toEqual({ userId: 123 });
    });

    it('should handle error with form validation errors', async () => {
      const mockAction = vi.fn(async (state, formData, error, _success) => {
        error('Validation failed', {
          formErrors: {
            email: ['Email is required'],
            password: ['Password too short'],
          },
        });
        return state; // Won't execute, but satisfies TypeScript
      }) as any;

      const formAction = createFormAction('test-action', mockAction);
      const initialState = createFormActionState(mockFormData);

      const result = await formAction(initialState, mockFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Validation failed');
      expect(result.formErrors).toEqual({
        email: ['Email is required'],
        password: ['Password too short'],
      });
    });
  });

  describe('defaultFormActionState', () => {
    it('should have correct default values', () => {
      expect(defaultFormActionState.success).toBe(false);
      expect(defaultFormActionState.message).toBe(null);
      expect(defaultFormActionState.payload).toBeInstanceOf(FormData);
    });
  });
});
