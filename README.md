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
- ✨ **Global error/success functions** for clean action code

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
import { createAction, error, success } from 'next-form-action';

export const loginAction = createAction('login', async (state, formData) => {
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

### 2. Use in Your Component

```tsx
'use client';

import { useAction } from 'next-form-action';
import { loginAction } from './actions';

export default function LoginForm() {
  const { Form, FormError, state, isPending } = useAction(loginAction);

  return (
    <Form className="space-y-4">
      <div>
        <input name="email" type="email" placeholder="Email" required className="w-full p-2 border rounded" />
      </div>

      <div>
        <input name="password" type="password" placeholder="Password" required className="w-full p-2 border rounded" />
      </div>

      <FormError className="text-red-500" />

      <button type="submit" disabled={isPending} className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50">
        {isPending ? 'Logging in...' : 'Login'}
      </button>
    </Form>
  );
}
```

## API Reference

### `createAction(context, handler)`

Creates a form action with built-in error handling and state management.

**Parameters:**

- `context` (string): A descriptive name for the action (used for logging)
- `handler` (function): The action function that handles form submission

**Action Function Parameters:**

- `state` (ActionState): Current form state
- `formData` (FormData): Form data from submission

### `createActionState(payload?, params?)`

Creates an initial action state object.

**Parameters:**

- `payload` (FormData, optional): Initial form data (defaults to empty FormData)
- `params` (ActionParams, optional): Additional state parameters

**Returns:** ActionState object

### `error(message, params?)`

Throws an error response to terminate action execution with an error state.

**Parameters:**

- `message` (string | undefined): Error message to display
- `params` (ActionParams, optional): Additional parameters like formErrors, redirect, etc.

### `success(message, params?)`

Throws a success response to terminate action execution with a success state.

**Parameters:**

- `message` (string | undefined): Success message to display
- `params` (ActionParams, optional): Additional parameters like redirect, refresh, etc.

### `useAction(action, actionState?)`

React hook for managing form state and submission.

**Parameters:**

- `action` (Action): The form action created with `createAction`
- `actionState` (ActionState, optional): Initial state for the form

**Returns:**

- `Form`: Pre-configured form component
- `FormError`: Component to display error messages
- `state`: Current form state
- `isPending`: Boolean indicating if form is submitting
- `formRef`: Ref of the form element
- `onFormSubmit`: Register callback for form submission (before processing)
- `onFormSuccess`: Register callback for successful submissions
- `onFormError`: Register callback for failed submissions

### Types

#### `ActionState`

```typescript
type ActionState = {
  payload?: FormData;
  success?: boolean;
  message?: string;
  formErrors?: Record<string, string[]>;
  extra?: Record<string, unknown>;
  redirect?: string;
  refresh?: boolean;
};
```

#### `ActionParams`

```typescript
type ActionParams = Omit<ActionState, 'message' | 'success'>;
```

#### Action Classes

The library also exports several classes for advanced use cases:

- `ActionResponse`: Base class for action responses
- `ActionError`: Error response class (extends ActionResponse)
- `ActionSuccess`: Success response class (extends ActionResponse)

These are primarily used internally but can be useful for custom error handling or testing scenarios.

## Advanced Usage

### Complete Lifecycle Management

```tsx
'use client';

import { useAction } from 'next-form-action';
import { createUserAction } from './actions';

export default function CreateUserForm() {
  const { Form, FormError, isPending, onFormSubmit, onFormSuccess, onFormError } = useAction(createUserAction);

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

  return (
    <Form className="space-y-4">
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />

      <FormError className="text-red-500" />

      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? 'Creating...' : 'Create User'}
      </button>
    </Form>
  );
}
```

**Note:** The `onFormSuccess` and `onFormError` callbacks are single-use - they execute once and then are automatically cleared. This prevents duplicate executions and memory leaks.

### Next.js System Error Handling

The library automatically handles Next.js system errors like `redirect()`, `notFound()`, and other framework-level errors:

```typescript
import { createAction, error, success } from 'next-form-action';
import { redirect, notFound } from 'next/navigation';

export const userAction = createAction('user', async (state, formData) => {
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

import { useAction } from 'next-form-action';
import { submitAction } from './actions';

export default function AdvancedForm() {
  const { Form, state, isPending, onFormSuccess, onFormError } = useAction(submitAction);

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
import { createAction, error, success } from 'next-form-action';

export const signupAction = createAction('signup', async (state, formData) => {
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
import { createAction, success } from 'next-form-action';

export const updateProfileAction = createAction('updateProfile', async (state, formData) => {
  // Update logic...

  success('Profile updated!', {
    refresh: true, // Refresh the current page
  });
});

export const deleteItemAction = createAction('deleteItem', async (state, formData) => {
  // Delete logic...

  success('Item deleted!', {
    redirect: '/items', // Redirect to items list
  });
});
```

## Key Features

### Global Error/Success Functions

The library now provides global `error()` and `success()` functions that can be imported and used directly in your actions, making the code cleaner and more intuitive:

```typescript
import { createAction, error, success } from 'next-form-action';

export const myAction = createAction('example', async (state, formData) => {
  if (!formData.get('required-field')) {
    error('Required field is missing'); // Throws and terminates execution
  }

  // Do your logic...

  success('Operation completed successfully!'); // Throws and terminates execution
});
```

The `error()` and `success()` functions work like `throw` statements - they immediately terminate the action execution and return the appropriate response to the client.

## Requirements

- Next.js 15+ (App Router)
- React 19+
- TypeScript 5+

## Development

This project uses `unbuild` for building and includes several utility scripts to help with development and publishing:

### Development Scripts

```bash
# Run all quality checks (type-check + lint + format check)
pnpm run check

# Build the package (generates both ESM and CommonJS)
pnpm run build

# Type check without emitting files
pnpm run type-check

# Lint code
pnpm run lint
pnpm run lint:fix

# Format code
pnpm run format
pnpm run format:check
```

### Module System

The package is built with dual module support:

- **ESM**: `dist/index.mjs` (primary module format)
- **CommonJS**: `dist/index.cjs` (for compatibility)
- **TypeScript**: `dist/index.d.ts` (type definitions)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Mattia Malonni](https://github.com/mattiamalonni)

## Links

- [GitHub Repository](https://github.com/mattiamalonni/next-form-action)
- [Issues](https://github.com/mattiamalonni/next-form-action/issues)
- [npm Package](https://www.npmjs.com/package/next-form-action)
