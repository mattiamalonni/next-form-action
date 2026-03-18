import { describe, expect, it } from 'vitest';
import { useAction } from '../src/client';

describe('useAction', () => {
  it('should be importable and be a function', () => {
    expect(typeof useAction).toBe('function');
  });
});
