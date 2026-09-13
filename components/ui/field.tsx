import type { ReactNode } from "react";
import { t } from "@/messages/ar";

export function Field({
  label,
  htmlFor,
  hint,
  optional,
  error,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  optional?: boolean;
  error?: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>
        {label}
        {optional ? (
          <span className="ms-1 text-xs font-normal text-muted">
            ({t.form.optional})
          </span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {error?.length ? (
        <p role="alert" className="mt-1 text-xs text-danger">
          {error[0]}
        </p>
      ) : null}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger"
    >
      {message}
    </p>
  );
}
