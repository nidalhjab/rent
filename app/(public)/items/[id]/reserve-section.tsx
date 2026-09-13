"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/ui/field";
import type { FormState } from "@/lib/validation";
import { t } from "@/messages/ar";
import { requestReservation } from "../actions";

const initialState: FormState = {};

export function ReserveSection({
  itemId,
  available,
}: {
  itemId: string;
  available: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    requestReservation,
    initialState,
  );
  const errors = state.errors ?? {};

  if (!available) {
    return (
      <p className="rounded-card border border-border bg-subtle p-5 text-center text-sm text-muted">
        {t.item.reserveDisabled}
      </p>
    );
  }

  if (state.status === "success") {
    return (
      <p className="rounded-card border border-success/30 bg-success-soft p-6 text-center text-sm font-medium text-success">
        {t.item.reserveSuccess}
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-card border border-border bg-surface p-6"
    >
      <div>
        <h2 className="font-semibold">{t.item.reserveTitle}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {t.item.reserveNote}
        </p>
      </div>

      <input type="hidden" name="itemId" value={itemId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.form.name} htmlFor="renterName" error={errors.renterName}>
          <input
            id="renterName"
            name="renterName"
            className="field"
            placeholder={t.form.namePlaceholder}
            required
          />
        </Field>

        <Field
          label={t.form.phone}
          htmlFor="renterPhone"
          error={errors.renterPhone}
        >
          <input
            id="renterPhone"
            name="renterPhone"
            type="tel"
            dir="ltr"
            className="field"
            placeholder={t.form.phonePlaceholder}
            required
          />
        </Field>
      </div>

      <Field
        label={t.form.date}
        htmlFor="preferredDate"
        optional
        error={errors.preferredDate}
      >
        <input
          id="preferredDate"
          name="preferredDate"
          type="date"
          className="field"
        />
      </Field>

      <Field label={t.form.note} htmlFor="note" optional error={errors.note}>
        <textarea id="note" name="note" rows={3} className="field" />
      </Field>

      <FormError message={state.error} />

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t.form.submitting : t.item.reserveCta}
      </Button>
    </form>
  );
}
