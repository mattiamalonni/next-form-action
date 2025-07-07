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
- 🔗 **Compatible with Zod** and other validation libraries

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
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginAction = createAction('login', async (state, formData) => {
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const result = loginSchema.safeParse(data);

  if (!result.success) {
    error('Please fix the errors below', { formErrors: result.error.flatten().fieldErrors });
  }

  const { email, password } = result.data;
  const user = await authenticateUser(email, password);

  if (!user) {
    error('Invalid email or password.');
  } else if (!user.isActive) {
    error('Please check your inbox for activation email.', { refresh: true });
  }

  success('Welcome back!', { redirect: '/dashboard' });
});
```

### 2. Use in Your Component

```tsx
'use client';

import { useAction } from 'next-form-action';
import { loginAction } from './actions';

export default function LoginForm() {
  const { state, isPending, dispatch, onSubmit, onSuccess, onError } = useAction(loginAction);

  // Called when form is submitted (before server action runs)
  onSubmit(formData => {
    console.log('Login attempt for:', formData.get('email'));
  });

  // Called when action succeeds
  onSuccess(state => {
    console.log('Success:', state.message);
  });

  // Called when action fails
  onError(state => {
    console.log('Error:', state.message);
  });

  return (
    <form action={dispatch}>
      <input name="email" type="email" placeholder="Email" required />
      {state.formErrors?.email && <span className="error">{state.formErrors.email[0]}</span>}

      <input name="password" type="password" placeholder="Password" required />
      {state.formErrors?.password && <span className="error">{state.formErrors.password[0]}</span>}

      {state.message && <div>{state.message}</div>}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
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
