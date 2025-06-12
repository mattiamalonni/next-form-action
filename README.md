# next-form-action

A TypeScript library for handling form actions in Next.js applications with enhanced developer experience and type safety.

## Features

- 🚀 **Type-safe form actions** with full TypeScript support
- 🎯 **Built-in state management** for form submissions
- 🔄 **Automatic redirects and refresh** handling
- 🎨 **React hooks** for seamless integration
- 📝 **Form validation** and error handling
- ⚡ **Next.js App Router** optimized
- 🌐 **Dual module support** (ESM + CommonJS)

## Installation

```bash
npm install next-form-action
# or
yarn add next-form-action
# or
pnpm add next-form-action
```

## Quick Start

### 1. Create a Form Action

```typescript
import { createFormAction } from 'next-form-action';

export const loginAction = createFormAction('login', async (state, formData, formActionError, formActionSuccess) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate input
  if (!email || !password) {
    formActionError('Email and password are required');
  }

  try {
    // Your authentication logic here
    const user = await authenticate(email, password);

    formActionSuccess('Login successful!', {
      redirect: '/dashboard',
    });
  } catch (error) {
    formActionError('Invalid credentials');
  }
});
```

### 2. Use in Your Component

```tsx
'use client';

import { useFormAction } from 'next-form-action';
import { loginAction } from './actions';

export default function LoginForm() {
  const { Form, FormError, state, isPending } = useFormAction(loginAction);

  return (
    <Form className="space-y-4">
      <div>
        <input name="email" type="email" placeholder="Email" required className="w-full p-2 border rounded" />
      </div>

      <div>
        <input name="password" type="password" placeholder="Password" required className="w-full p-2 border rounded" />
      </div>

      <FormError className="text-red-500" />

      <button
        type="submit"
        disabled={isPending}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isPending ? 'Logging in...' : 'Login'}
      </button>
    </Form>
  );
}
```

## API Reference

### `createFormAction(context, actionFn)`

Creates a form action with built-in error handling and state management.

**Parameters:**

- `context` (string): A descriptive name for the action (used for logging)
- `actionFn` (function): The action function that handles form submission

**Action Function Parameters:**

- `state` (FormActionState): Current form state
- `formData` (FormData): Form data from submission
- `formActionError` (function): Function to throw an error response
- `formActionSuccess` (function): Function to throw a success response

### `useFormAction(formAction)`

React hook for managing form state and submission.

**Returns:**

- `Form`: Pre-configured form component
- `FormError`: Component to display error messages
- `state`: Current form state
- `isPending`: Boolean indicating if form is submitting
- `onFormSuccess`: Register success callbacks
- `onFormError`: Register error callbacks

### Types

#### `FormActionState`

```typescript
type FormActionState = {
  payload?: FormData;
  success: boolean;
  message: string | null;
  formErrors?: Record<string, string[]>;
  extra?: Record<string, unknown>;
  redirect?: string;
  refresh?: boolean;
};
```

#### `FormActionParams`

```typescript
type FormActionParams = Omit<FormActionState, 'payload' | 'success' | 'message'>;
```

## Advanced Usage

### Custom Success/Error Handling

```tsx
'use client';

import { useFormAction } from 'next-form-action';
import { submitAction } from './actions';

export default function AdvancedForm() {
  const { Form, state, isPending, onFormSuccess, onFormError } = useFormAction(submitAction);

  // Register custom callbacks
  onFormSuccess(state => {
    console.log('Form submitted successfully!', state);
    // Custom success logic
  });

  onFormError(state => {
    console.error('Form submission failed:', state);
    // Custom error handling
  });

  return <Form>{/* Your form content */}</Form>;
}
```

### Form Validation with Multiple Errors

```typescript
import { createFormAction } from 'next-form-action';

export const signupAction = createFormAction('signup', async (state, formData, formActionError, formActionSuccess) => {
  const formErrors: Record<string, string[]> = {};

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email) {
    formErrors.email = ['Email is required'];
  } else if (!isValidEmail(email)) {
    formErrors.email = ['Please enter a valid email'];
  }

  if (!password) {
    formErrors.password = ['Password is required'];
  } else if (password.length < 8) {
    formErrors.password = ['Password must be at least 8 characters'];
  }

  if (Object.keys(formErrors).length > 0) {
    formActionError('Please fix the errors below', { formErrors });
  }

  // Process signup...
  formActionSuccess('Account created successfully!', {
    redirect: '/welcome',
  });
});
```

### Redirect and Refresh

```typescript
import { createFormAction } from 'next-form-action';

export const updateProfileAction = createFormAction(
  'updateProfile',
  async (state, formData, formActionError, formActionSuccess) => {
    // Update logic...

    formActionSuccess('Profile updated!', {
      refresh: true, // Refresh the current page
    });
  },
);

export const deleteItemAction = createFormAction(
  'deleteItem',
  async (state, formData, formActionError, formActionSuccess) => {
    // Delete logic...

    formActionSuccess('Item deleted!', {
      redirect: '/items', // Redirect to items list
    });
  },
);
```

## Requirements

- Next.js 15+ (App Router)
- React 19+
- TypeScript 5+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Mattia Malonni](https://github.com/mattiamalonni)

## Links

- [GitHub Repository](https://github.com/mattiamalonni/next-form-action)
- [Issues](https://github.com/mattiamalonni/next-form-action/issues)
- [npm Package](https://www.npmjs.com/package/next-form-action)
