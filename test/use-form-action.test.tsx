import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useFormAction } from '@/use-form-action';
import { type FormAction } from '@/actions';

// Mock the hooks to avoid complex setup
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: vi.fn(() => [{ success: false, message: null, payload: new FormData() }, vi.fn(), false]),
  };
});

// Create a test component that uses the hook
function TestComponent({ formAction }: { formAction: FormAction }) {
  const { Form, FormError, state, isPending } = useFormAction(formAction);

  return (
    <div>
      <Form data-testid="form">
        <input name="email" data-testid="email-input" />
        <button type="submit" disabled={isPending} data-testid="submit-button">
          {isPending ? 'Loading...' : 'Submit'}
        </button>
      </Form>
      <FormError data-testid="form-error" />
      <div data-testid="state-success">{state.success.toString()}</div>
    </div>
  );
}

describe('useFormAction', () => {
  const mockFormAction: FormAction = vi.fn().mockResolvedValue({
    success: false,
    message: null,
    payload: new FormData(),
  });

  it('should render form components correctly', () => {
    render(<TestComponent formAction={mockFormAction} />);

    expect(screen.getByTestId('form')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('should display correct initial state', () => {
    render(<TestComponent formAction={mockFormAction} />);

    const submitButton = screen.getByTestId('submit-button');
    const stateDisplay = screen.getByTestId('state-success');

    expect(submitButton).toHaveTextContent('Submit');
    expect(submitButton).not.toBeDisabled();
    expect(stateDisplay).toHaveTextContent('false');
  });
});
