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
- 🔧 **Lifecycle callbacks** for submit, success, and error events
- 🛡️ **Next.js error handling** for redirects and system errors

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

export const loginAction = createFormAction('login', async (state, formData, error, success) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate input
  if (!email || !password) {
    error('Email and password are required');
  }

  try {
    // Your authentication logic here
    const user = await authenticate(email, password);

    success('Login successful!', {
      redirect: '/dashboard',
    });
  } catch (err) {
    error('Invalid credentials');
  }
});
```

**Note:** The library automatically handles Next.js system errors like `redirect()` and `notFound()`, so you can use them directly in your actions without additional error handling.

````

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
````

## API Reference

### `createFormAction(context, actionFn)`

Creates a form action with built-in error handling and state management.

**Parameters:**

- `context` (string): A descriptive name for the action (used for logging)
- `actionFn` (function): The action function that handles form submission

**Action Function Parameters:**

- `state` (FormActionState): Current form state
- `formData` (FormData): Form data from submission
- `error` (function): Function to throw an error response
- `success` (function): Function to throw a success response

### `useFormAction(formAction)`

React hook for managing form state and submission.

**Returns:**

- `Form`: Pre-configured form component
- `FormError`: Component to display error messages
- `state`: Current form state
- `isPending`: Boolean indicating if form is submitting
- `onFormSubmit`: Register callback for form submission (before processing)
- `onFormSuccess`: Register callback for successful submissions
- `onFormError`: Register callback for failed submissions

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

### Complete Lifecycle Management

```tsx
'use client';

import { useFormAction } from 'next-form-action';
import { createUserAction } from './actions';

export default function CreateUserForm() {
  const { Form, FormError, isPending, onFormSubmit, onFormSuccess, onFormError } = useFormAction(createUserAction);

  const handleCreateUser = () => {
    // Called immediately when form is submitted
    onFormSubmit(formData => {
      console.log('📤 Submitting user creation...');
      analytics.track('user_creation_started', {
        email: formData.get('email'),
      });
    });

    // Called when action completes successfully
    onFormSuccess(state => {
      console.log('✅ User created successfully!');
      toast.success(state.message);
      router.push('/users');
    });

    // Called when action fails
    onFormError(state => {
      console.log('❌ User creation failed');
      toast.error(state.message);
      analytics.track('user_creation_failed');
    });
  };

  return (
    <Form className="space-y-4">
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />

      <FormError className="text-red-500" />

      <button type="submit" onClick={handleCreateUser} disabled={isPending} className="btn-primary">
        {isPending ? 'Creating...' : 'Create User'}
      </button>
    </Form>
  );
}
```

### Next.js System Error Handling

The library automatically handles Next.js system errors like `redirect()`, `notFound()`, and other framework-level errors:

```typescript
import { createFormAction } from 'next-form-action';
import { redirect, notFound } from 'next/navigation';

export const userAction = createFormAction('user', async (state, formData, error, success) => {
  const userId = formData.get('userId') as string;

  // These Next.js errors are automatically handled
  if (!userId) {
    notFound(); // Will trigger Next.js 404 page
  }

  const user = await updateUser(userId, formData);

  if (user.needsVerification) {
    redirect('/verify'); // Will redirect properly
  }

  success('User updated successfully!');
});
```

### Custom Success/Error Handling

```tsx
'use client';

import { useFormAction } from 'next-form-action';
import { submitAction } from './actions';

export default function AdvancedForm() {
  const { Form, state, isPending, onFormSuccess, onFormError } = useFormAction(submitAction);

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

export const signupAction = createFormAction('signup', async (state, formData, error, success) => {
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
    error('Please fix the errors below', { formErrors });
  }

  // Process signup...
  success('Account created successfully!', {
    redirect: '/welcome',
  });
});
```

### Redirect and Refresh

```typescript
import { createFormAction } from 'next-form-action';

export const updateProfileAction = createFormAction('updateProfile', async (state, formData, error, success) => {
  // Update logic...

  success('Profile updated!', {
    refresh: true, // Refresh the current page
  });
});

export const deleteItemAction = createFormAction('deleteItem', async (state, formData, error, success) => {
  // Delete logic...

  success('Item deleted!', {
    redirect: '/items', // Redirect to items list
  });
});
```

## Requirements

- Next.js 15+ (App Router)
- React 19+
- TypeScript 5+

## Development

This project includes several utility scripts to help with development and publishing:

### Development Scripts

```bash
# Run all quality checks
pnpm run check

# Build the package
pnpm run build

# Type check
pnpm run type-check

# Lint and format
pnpm run lint
pnpm run lint:fix
pnpm run format:check
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Mattia Malonni](https://github.com/mattiamalonni)

## Links

- [GitHub Repository](https://github.com/mattiamalonni/next-form-action)
- [Issues](https://github.com/mattiamalonni/next-form-action/issues)
- [npm Package](https://www.npmjs.com/package/next-form-action)

### Callback Behavior

All callbacks (`onFormSubmit`, `onFormSuccess`, `onFormError`) are **one-shot** - they execute once per form submission and are automatically cleared afterward. This prevents unintended side effects and ensures clean state management.

```tsx
const handleSubmit = () => {
  // This callback will run only for this specific submission
  onFormSuccess(() => {
    showNotification('Operation completed!');
  });
};
```
