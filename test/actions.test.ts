import { describe, expect, it } from 'vitest';
import { ActionError, ActionSuccess, createAction, error, success } from '../src/server';

describe('actions', () => {
  describe('success', () => {
    it('should throw ActionSuccess with message', () => {
      expect(() => success('Done!')).toThrow(ActionSuccess);
    });

    it('should throw ActionSuccess with params', () => {
      expect(() => success('Done!', { refresh: true })).toThrow(ActionSuccess);
    });
  });

  describe('error', () => {
    it('should throw ActionError with message', () => {
      expect(() => error('Failed!')).toThrow(ActionError);
    });

    it('should throw ActionError with params', () => {
      expect(() => error('Failed!', { redirect: '/login' })).toThrow(ActionError);
    });
  });

  describe('createAction', () => {
    it('should execute handler and return success', async () => {
      const handler = async (data: { name: string }) => {
        if (data.name === 'success') {
          success('All good!');
        }
        return { success: true, message: 'Fallback' };
      };

      const action = createAction(handler, 'testAction');
      const result = await action({ name: 'success' });

      expect(result?.success).toBe(true);
      expect(result?.message).toBe('All good!');
    });

    it('should catch ActionError and return error state', async () => {
      const handler = async (data: { name: string }) => {
        if (data.name === 'fail') {
          error('Something went wrong');
        }
        return { success: true, message: 'Fallback' };
      };

      const action = createAction(handler, 'testAction');
      const result = await action({ name: 'fail' });

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Something went wrong');
    });

    it('should rethrow Next.js system errors (redirect, notFound)', async () => {
      const handler = async () => {
        const err = new Error('REDIRECT');
        (err as Error & { digest: string }).digest = 'NEXT_REDIRECT';
        throw err;
      };

      const action = createAction(handler, 'testAction');
      await expect(action({})).rejects.toThrow('REDIRECT');
    });

    it('should catch unexpected errors', async () => {
      const handler = async () => {
        throw new Error('Unexpected error');
      };

      const action = createAction(handler, 'testAction');
      const result = await action({});

      expect(result?.success).toBe(false);
      expect(result?.message).toContain('Unexpected error');
    });
  });
});
