"use client";

import { useActionState } from "react";
import { ItemImagesField } from "@/components/upload/item-images-field";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FormError } from "@/components/ui/field";
import { site } from "@/config/site";
import { Category, Condition } from "@/lib/generated/prisma/enums";
import type { FormState } from "@/lib/validation";
import { t } from "@/messages/ar";
import { submitItem } from "../actions";

const initialState: FormState = {};

export function SubmitItemForm() {
  const [state, formAction, pending] = useActionState(submitItem, initialState);
  const errors = state.errors ?? {};

  if (state.status === "success") {
    return (
      <div className="rounded-card border border-border bg-surface p-10 text-center">
        <h2 className="text-xl font-bold text-success">
          {t.submit.successTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          {t.submit.successBody}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/items/new">{t.submit.addAnother}</ButtonLink>
          <ButtonLink href="/items" variant="secondary">
            {t.nav.browse}
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-10">
      <section className="space-y-4 rounded-card border border-border bg-surface p-6">
        <h2 className="font-semibold">{t.submit.section.item}</h2>

        <Field label={t.submit.titleField} htmlFor="title" error={errors.title}>
          <input
            id="title"
            name="title"
            className="field"
            placeholder={t.submit.titlePlaceholder}
            required
          />
        </Field>

        <Field
          label={t.submit.description}
          htmlFor="description"
          optional
          error={errors.description}
        >
          <textarea
            id="description"
            name="description"
            rows={4}
            className="field"
            placeholder={t.submit.descriptionPlaceholder}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t.submit.category}
            htmlFor="category"
            error={errors.category}
          >
            <select id="category" name="category" className="field" defaultValue="DRESS">
              {Object.values(Category).map((value) => (
                <option key={value} value={value}>
                  {t.enums.category[value]}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t.submit.size} htmlFor="size" error={errors.size}>
            <select id="size" name="size" className="field" defaultValue="M">
              {site.dressSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t.submit.color} htmlFor="color" error={errors.color}>
            <input
              id="color"
              name="color"
              className="field"
              placeholder={t.submit.colorPlaceholder}
              required
            />
          </Field>

          <Field label={t.submit.city} htmlFor="city" error={errors.city}>
            <select id="city" name="city" className="field" defaultValue="">
              <option value="" disabled>
                —
              </option>
              {site.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={t.submit.condition}
            htmlFor="condition"
            error={errors.condition}
          >
            <select
              id="condition"
              name="condition"
              className="field"
              defaultValue="EXCELLENT"
            >
              {Object.values(Condition).map((value) => (
                <option key={value} value={value}>
                  {t.enums.condition[value]}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={t.submit.timesWorn}
            htmlFor="timesWorn"
            error={errors.timesWorn}
          >
            <input
              id="timesWorn"
              name="timesWorn"
              type="number"
              min={0}
              max={50}
              defaultValue={1}
              className="field"
              required
            />
          </Field>

          <Field
            label={`${t.submit.price} (${site.currency})`}
            htmlFor="pricePerDay"
            error={errors.pricePerDay}
          >
            <input
              id="pricePerDay"
              name="pricePerDay"
              type="number"
              min={10}
              max={10000}
              className="field"
              required
            />
          </Field>

          <Field
            label={`${t.submit.depositAmount} (${site.currency})`}
            htmlFor="depositAmount"
            optional
            error={errors.depositAmount}
          >
            <input
              id="depositAmount"
              name="depositAmount"
              type="number"
              min={0}
              max={50000}
              className="field"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-card border border-border bg-surface p-6">
        <h2 className="font-semibold">{t.submit.section.images}</h2>
        <ItemImagesField
          error={
            errors.images?.[0] ??
            errors.imageFront?.[0] ??
            errors.imageBack?.[0] ??
            errors.imageDetail?.[0]
          }
        />
      </section>

      <section className="space-y-4 rounded-card border border-border bg-surface p-6">
        <h2 className="font-semibold">{t.submit.section.owner}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t.submit.ownerName}
            htmlFor="ownerName"
            error={errors.ownerName}
          >
            <input
              id="ownerName"
              name="ownerName"
              className="field"
              placeholder={t.form.namePlaceholder}
              required
            />
          </Field>

          <Field
            label={t.submit.ownerPhone}
            htmlFor="ownerPhone"
            hint={t.submit.ownerPhoneHelp}
            error={errors.ownerPhone}
          >
            <input
              id="ownerPhone"
              name="ownerPhone"
              type="tel"
              dir="ltr"
              className="field"
              placeholder={t.form.phonePlaceholder}
              required
            />
          </Field>
        </div>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-1 size-4 shrink-0 accent-primary"
          />
          <span className="leading-relaxed text-muted">
            {t.submit.consent}
          </span>
        </label>
        {errors.consent?.length ? (
          <p role="alert" className="text-xs text-danger">
            {errors.consent[0]}
          </p>
        ) : null}
      </section>

      <FormError message={state.error} />

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? t.form.submitting : t.submit.submitCta}
      </Button>
    </form>
  );
}
