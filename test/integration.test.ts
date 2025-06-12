import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFormAction, createFormActionState } from '@/actions';

describe('Integration Tests', () => {
  let mockFormData: FormData;

  beforeEach(() => {
    mockFormData = new FormData();
    mockFormData.append('username', 'testuser');
    mockFormData.append('email', 'test@example.com');
    vi.clearAllMocks();
  });

  describe('Full form action workflow', () => {
    it('should handle successful form submission with redirect', async () => {
      const mockAction = createFormAction('user-registration', async (state, formData, error, success) => {
        const username = formData.get('username') as string;
        const email = formData.get('email') as string;

        if (!username || !email) {
          error('Username and email are required');
        }

        // Simulate successful user creation
        success('User created successfully!', {
          redirect: '/dashboard',
          extra: { userId: 123 },
        });

        return state; // Won't execute, but satisfies TypeScript
      });

      const initialState = createFormActionState(mockFormData);
      const result = await mockAction(initialState, mockFormData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User created successfully!');
      expect(result.redirect).toBe('/dashboard');
      expect(result.extra).toEqual({ userId: 123 });
      expect(result.payload).toBe(mockFormData);
    });

    it('should handle form validation errors', async () => {
      const mockAction = createFormAction('user-validation', async (state, formData, error, success) => {
        const formErrors: Record<string, string[]> = {};

        const username = formData.get('username') as string;
        const email = formData.get('email') as string;

        if (!username) {
          formErrors.username = ['Username is required'];
        } else if (username.length < 3) {
          formErrors.username = ['Username must be at least 3 characters'];
        }

        if (!email) {
          formErrors.email = ['Email is required'];
        } else if (!email.includes('@')) {
          formErrors.email = ['Please enter a valid email address'];
        }

        if (Object.keys(formErrors).length > 0) {
          error('Please fix the errors below', { formErrors });
        }

        success('Validation passed!');
        return state; // Won't execute, but satisfies TypeScript
      });

      // Test with invalid data
      const invalidFormData = new FormData();
      invalidFormData.append('username', 'ab'); // Too short
      invalidFormData.append('email', 'invalid-email'); // Missing @

      const initialState = createFormActionState(invalidFormData);
      const result = await mockAction(initialState, invalidFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Please fix the errors below');
      expect(result.formErrors).toEqual({
        username: ['Username must be at least 3 characters'],
        email: ['Please enter a valid email address'],
      });
    });

    it('should handle server errors gracefully', async () => {
      const mockAction = createFormAction('server-error', async (_state, _formData, _error, _success) => {
        // Simulate server error
        throw new Error('Database connection failed');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const initialState = createFormActionState(mockFormData);
      const result = await mockAction(initialState, mockFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('An unexpected error occurred. Please try again.');
      expect(consoleSpy).toHaveBeenCalledWith('Error in form action "server-error":', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle multiple success scenarios', async () => {
      const scenarios = [
        {
          name: 'with-refresh',
          params: { refresh: true },
          expected: { refresh: true },
        },
        {
          name: 'with-redirect',
          params: { redirect: '/success' },
          expected: { redirect: '/success' },
        },
        {
          name: 'with-extra-data',
          params: { extra: { token: 'abc123' } },
          expected: { extra: { token: 'abc123' } },
        },
      ];

      for (const scenario of scenarios) {
        const mockAction = createFormAction(scenario.name, async (state, formData, error, success) => {
          success('Success!', scenario.params);
          return state; // Won't execute, but satisfies TypeScript
        });

        const initialState = createFormActionState(mockFormData);
        const result = await mockAction(initialState, mockFormData);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Success!');
        Object.keys(scenario.expected).forEach(key => {
          expect(result[key as keyof typeof result]).toEqual(scenario.expected[key as keyof typeof scenario.expected]);
        });
      }
    });

    it('should maintain form data integrity throughout the process', async () => {
      const mockAction = createFormAction('data-integrity', async (state, formData, error, success) => {
        // Verify that formData contains expected values
        expect(formData.get('username')).toBe('testuser');
        expect(formData.get('email')).toBe('test@example.com');

        // Verify state has the payload
        expect(state.payload).toBe(formData);

        success('Data integrity confirmed');
        return state; // Won't execute, but satisfies TypeScript
      });

      const initialState = createFormActionState(mockFormData);
      const result = await mockAction(initialState, mockFormData);

      expect(result.success).toBe(true);
      expect(result.payload).toBe(mockFormData);
      expect(result.payload?.get('username')).toBe('testuser');
      expect(result.payload?.get('email')).toBe('test@example.com');
    });

    it('should handle complex business logic scenarios', async () => {
      const mockAction = createFormAction('business-logic', async (state, formData, error, success) => {
        const userType = formData.get('userType') as string;
        const age = parseInt(formData.get('age') as string, 10);

        if (userType === 'admin' && age < 21) {
          error('Admin users must be at least 21 years old');
        }

        if (userType === 'premium' && !formData.get('paymentMethod')) {
          error('Premium users must provide a payment method', {
            formErrors: {
              paymentMethod: ['Payment method is required for premium accounts'],
            },
          });
        }

        // Business logic passed
        const redirectPath = userType === 'admin' ? '/admin-dashboard' : '/user-dashboard';
        success(`Welcome, ${userType} user!`, {
          redirect: redirectPath,
          extra: { userType, welcomeBonus: userType === 'premium' ? 100 : 0 },
        });
        return state; // Won't execute, but satisfies TypeScript
      });

      // Test admin user scenario
      const adminFormData = new FormData();
      adminFormData.append('userType', 'admin');
      adminFormData.append('age', '25');

      const adminState = createFormActionState(adminFormData);
      const adminResult = await mockAction(adminState, adminFormData);

      expect(adminResult.success).toBe(true);
      expect(adminResult.message).toBe('Welcome, admin user!');
      expect(adminResult.redirect).toBe('/admin-dashboard');
      expect(adminResult.extra).toEqual({ userType: 'admin', welcomeBonus: 0 });

      // Test premium user scenario
      const premiumFormData = new FormData();
      premiumFormData.append('userType', 'premium');
      premiumFormData.append('age', '30');
      premiumFormData.append('paymentMethod', 'credit-card');

      const premiumState = createFormActionState(premiumFormData);
      const premiumResult = await mockAction(premiumState, premiumFormData);

      expect(premiumResult.success).toBe(true);
      expect(premiumResult.message).toBe('Welcome, premium user!');
      expect(premiumResult.redirect).toBe('/user-dashboard');
      expect(premiumResult.extra).toEqual({ userType: 'premium', welcomeBonus: 100 });
    });
  });
});
