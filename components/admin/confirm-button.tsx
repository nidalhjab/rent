"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

/**
 * Destructive admin actions are irreversible (rows and Cloudinary assets are
 * deleted), so they go through a native confirm before the form submits.
 */
export function ConfirmButton({
  message,
  ...props
}: ComponentProps<typeof Button> & { message: string }) {
  return (
    <Button
      {...props}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    />
  );
}
