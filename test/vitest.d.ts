import '@testing-library/jest-dom';
import { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import type { Matchers as JestMatchers } from '@jest/types';

declare module 'vitest' {
  interface Assertion<T = any> extends JestMatchers<void>, TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining extends JestMatchers<void>, TestingLibraryMatchers<any, void> {}
}
