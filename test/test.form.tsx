'use client';

import { useAction } from '../src/hook';
import { testAction } from './test.action';

export const TestForm = () => {
  const { dispatch, state } = useAction(testAction);

  return (
    <div>
      <form action={dispatch}>
        <input type="text" name="testInput" required />
        {state.formErrors?.testInput && <span className="error">{state.formErrors.testInput[0]}</span>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
