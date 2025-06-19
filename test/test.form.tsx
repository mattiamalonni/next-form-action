'use client';

import { useAction } from '../src/use-action';
import { testAction } from './test.action';

export const TestForm = () => {
  const { Form, FormError } = useAction(testAction);

  return (
    <div>
      <Form>
        <input type="text" name="testInput" required />
        <button type="submit">Submit</button>
      </Form>
      <FormError className="error-message" />
    </div>
  );
};
