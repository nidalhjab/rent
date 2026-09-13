"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { t } from "@/messages/ar";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="username">
          {t.admin.username}
        </label>
        <input
          id="username"
          name="username"
          className="field"
          autoComplete="username"
          dir="ltr"
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          {t.admin.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="field"
          autoComplete="current-password"
          dir="ltr"
          required
        />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? t.form.submitting : t.admin.loginCta}
      </Button>
    </form>
  );
}
