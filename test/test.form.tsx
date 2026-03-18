'use client';

import { FormEvent } from 'react';
import { useAction } from '../src/hook';
import { testAction } from './test.action';

interface TestData {
  name: string;
  email: string;
}

export function TestForm() {
  const { dispatch, state, isPending } = useAction<TestData>(testAction, {
    onSuccess: result => {
      console.log('Form submitted successfully!', result.message);
    },
    onError: result => {
      console.error('Form submission failed:', result.message);
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: TestData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    };
    dispatch(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="Enter your name" required />
      <input type="email" name="email" placeholder="Enter your email" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
      {state?.message && <p className={state.success ? 'success' : 'error'}>{state.message}</p>}
    </form>
  );
}
