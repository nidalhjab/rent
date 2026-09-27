"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/ui/field";
import type { FormState } from "@/lib/validation";
import { t } from "@/messages/ar";
import { requestReservation } from "../actions";
import { addDays, firstAvailableDate, formatBookingDate, overlapsBooking, RESERVATION_GAP_DAYS } from "@/lib/booking-dates";

const initialState: FormState = {};

export function ReserveSection({
  itemId,
  available,
  today,
  maxDate,
  bookedStarts,
}: {
  itemId: string;
  available: boolean;
  today: string;
  maxDate: string;
  bookedStarts: string[];
}) {
  const [state, formAction, pending] = useActionState(
    requestReservation,
    initialState,
  );
  const errors = state.errors ?? {};
  const firstDate = firstAvailableDate(today, bookedStarts);
  const [selectedDate, setSelectedDate] = useState("");
  const date = selectedDate || (firstDate <= maxDate ? firstDate : "");
  const dateBlocked = !!date && bookedStarts.some((start) => overlapsBooking(date, start));

  if (!available) {
    return (
      <p className="rounded-card border border-border bg-subtle p-5 text-center text-sm text-muted">
        {t.item.reserveDisabled}
      </p>
    );
  }

  if (state.status === "success") {
    return (
      <p role="status" className="rounded-card border border-success/30 bg-success-soft p-6 text-center text-sm font-medium text-success">
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
        <p className="mt-2 text-xs text-muted">
          {firstDate <= maxDate ? `${t.item.firstAvailable}: ${formatBookingDate(firstDate)}` : t.item.noDates}
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
            autoComplete="name"
            maxLength={80}
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
            autoComplete="tel"
            maxLength={20}
          />
        </Field>
      </div>

      <Field
        label={t.form.date}
        htmlFor="preferredDate"
        error={dateBlocked ? [t.validation.dateBooked] : errors.preferredDate}
      >
        <input
          id="preferredDate"
          name="preferredDate"
          type="date"
          className="field"
          dir="ltr"
          required
          min={today}
          max={maxDate}
          value={date}
          onChange={(event) => setSelectedDate(event.target.value)}
          aria-invalid={dateBlocked || !!errors.preferredDate}
        />
      </Field>
      {bookedStarts.length > 0 ? (
        <details className="text-sm text-muted">
          <summary className="cursor-pointer py-2">{t.item.bookedDates}</summary>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
            {bookedStarts.map((start) => <li key={start}>
              {t.form.date}: {formatBookingDate(start)}
              <span className="block text-xs">{t.item.nextAvailableDate} {formatBookingDate(addDays(start, RESERVATION_GAP_DAYS))}</span>
            </li>)}
          </ul>
        </details>
      ) : null}

      <Field label={t.form.note} htmlFor="note" optional error={errors.note}>
        <textarea id="note" name="note" rows={3} maxLength={500} className="field" />
      </Field>

      <FormError message={state.error} />

      <Button type="submit" className="w-full" disabled={pending || dateBlocked || !date || firstDate > maxDate}>
        {pending ? t.form.submitting : t.item.reserveCta}
      </Button>
    </form>
  );
}
