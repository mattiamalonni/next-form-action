# next-form-action

A TypeScript library for handling server actions in Next.js with type-safe error handling and callbacks.

## Features

- 🚀 **Type-safe server actions** with full TypeScript support
- 🎯 **Generic data handling** - work with any data type, not just FormData
- 🔄 **Automatic redirects and refresh** handling
- 🎨 **React hooks** for seamless integration with `useTransition`
- 🛡️ **Discriminated union types** for better type safety
- ⚡ **Next.js 16+ optimized** with proper error digest handling
- 🌐 **Dual module support** (ESM + CommonJS)
- 🔧 **Lifecycle callbacks** for success and error events
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

### 1. Create a Server Action

```typescript
import { createAction, error, success } from "next-form-action";

interface LoginData {
  email: string;
  password: string;
}

export const loginAction = createAction<LoginData>(
  async (data) => {
    // Validate input
    if (!data.email || !data.password) {
      error("Email and password are required");
    }

    // Authenticate user
    const user = await authenticateUser(data.email, data.password);

    if (!user) {
      error("Invalid email or password.");
    }

    if (!user.isActive) {
      error("Please check your inbox for activation email.");
    }

    // Success with redirect
    success("Welcome back!", { redirect: "/dashboard" });
  },
  "loginAction", // context for logging
);
```

### 2. Use in Your Component

```tsx
"use client";

import { FormEvent } from "react";
import { useAction } from "next-form-action";
import { loginAction } from "./actions";

interface LoginData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const { dispatch, state, isPending } = useAction<LoginData>(loginAction, {
    onSuccess: (result) => {
      console.log("Logged in:", result.message);
    },
    onError: (result) => {
      console.log("Login failed:", result.message);
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: LoginData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };
    dispatch(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />

      {state?.message && <div className={state.success ? "success" : "error"}>{state.message}</div>}

      <button type="submit" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
```

## API Reference

### `createAction<T>(handler, context?)`

Creates a type-safe server action wrapper.

```typescript
export const myAction = createAction<MyDataType>(
  async (data: MyDataType) => {
    // Your action logic here
    // Throw error() or success() to return state
    success("Done!");
  },
  "myActionName", // Optional context for logging
);
```

**Parameters:**

- `handler` - Async function that receives typed data and returns/throws ActionState
- `context` - Optional string for error logging context

### `useAction<T>(action, options?)`

Hook to use a server action in your component.

```typescript
const { dispatch, state, isPending } = useAction<MyDataType>(myAction, {
  onSuccess: (state) => {
    /* called when success() is thrown */
  },
  onError: (state) => {
    /* called when error() is thrown */
  },
});

// Call with data
dispatch(myData);
```

**Returns:**

- `dispatch` - Function to call the action with data
- `state` - Current ActionState (undefined until first call)
- `isPending` - Boolean indicating if action is running

### `success(message?, options?)`

Throw in your action to return success state.

```typescript
success("Operation completed!", {
  redirect: "/next-page",
  refresh: true,
});
```

### `error(message?, options?)`

Throw in your action to return error state.

```typescript
error("Something went wrong", {
  redirect: "/error",
});
```

## ActionState Type

The return type of actions is a **discriminated union**:

```typescript
type ActionState =
  | { success: true; message?: string; redirect?: string; refresh?: boolean }
  | { success: false; message?: string; redirect?: string; refresh?: boolean };
```

You can safely narrow the type:

```typescript
if (state?.success) {
  // state is success state here
  console.log("Success:", state.message);
} else if (state?.success === false) {
  // state is error state here
  console.log("Error:", state.message);
}
```

## Requirements

- Next.js 16+ (App Router)
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
