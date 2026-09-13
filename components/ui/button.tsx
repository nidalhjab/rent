import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium transition " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:pointer-events-none disabled:opacity-55";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary:
    "border border-border bg-surface text-foreground hover:border-primary hover:text-primary",
  ghost: "text-muted hover:bg-subtle hover:text-foreground",
  danger: "bg-danger-soft text-danger hover:bg-danger hover:text-white",
  success: "bg-success text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

type StyleProps = { variant?: Variant; size?: Size; className?: string };

export const buttonClass = ({
  variant = "primary",
  size = "md",
  className = "",
}: StyleProps = {}) => `${base} ${variants[variant]} ${sizes[size]} ${className}`;

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & StyleProps) {
  return (
    <button
      {...props}
      className={buttonClass({ variant, size, className })}
    />
  );
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & StyleProps) {
  return <Link {...props} className={buttonClass({ variant, size, className })} />;
}
