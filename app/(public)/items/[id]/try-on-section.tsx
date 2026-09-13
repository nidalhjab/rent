"use client";

import { useState, type FormEvent } from "react";
import type { TryOnRenderDto } from "@/app/api/try-on/serialize";
import { Button } from "@/components/ui/button";
import { CloudImage } from "@/components/ui/cloud-image";
import { Field, FormError } from "@/components/ui/field";
import { SkinTone } from "@/lib/generated/prisma/enums";
import { t } from "@/messages/ar";

const SWATCHES: Record<SkinTone, string> = {
  FAIR: "#f6e0d1",
  LIGHT: "#efcbb1",
  MEDIUM: "#deae91",
  OLIVE: "#c69572",
  TAN: "#a5704a",
  DEEP: "#6d452f",
};

type Status = "idle" | "creating" | "front" | "back" | "done" | "error";

async function postJson(url: string, payload: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? t.tryOn.failed);
  return data as TryOnRenderDto;
}

export function TryOnSection({
  itemId,
  enabled,
}: {
  itemId: string;
  enabled: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [render, setRender] = useState<{
    front: string | null;
    back: string | null;
  }>({ front: null, back: null });
  const [error, setError] = useState<string>();

  const busy = status === "creating" || status === "front" || status === "back";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const bodyNote = String(form.get("bodyNote") ?? "").trim();

    setError(undefined);
    setRender({ front: null, back: null });
    setStatus("creating");

    try {
      let job = await postJson("/api/try-on", {
        itemId,
        heightCm: String(form.get("heightCm") ?? ""),
        weightKg: String(form.get("weightKg") ?? ""),
        skinTone: String(form.get("skinTone") ?? ""),
        bodyNote: bodyNote || undefined,
      });
      setRender({ front: job.front, back: job.back });

      // Front first, then back conditioned on it, so both views match.
      if (!job.front) {
        setStatus("front");
        job = await postJson(`/api/try-on/${job.id}`, { view: "FRONT" });
        setRender({ front: job.front, back: job.back });
      }

      if (!job.back) {
        setStatus("back");
        job = await postJson(`/api/try-on/${job.id}`, { view: "BACK" });
        setRender({ front: job.front, back: job.back });
      }

      setStatus("done");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.tryOn.failed);
      setStatus("error");
    }
  }

  return (
    <section
      id="try-on"
      className="scroll-mt-20 rounded-card border border-primary/20 bg-primary-soft/50 p-6 sm:p-8"
    >
      <div className="mb-6 text-center">
        <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
          {t.tryOn.badge}
        </span>
        <h2 className="mt-3 text-2xl font-bold">{t.tryOn.title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
          {t.tryOn.intro}
        </p>
      </div>

      {!enabled ? (
        <p className="rounded-card bg-surface p-6 text-center text-sm text-muted">
          {t.tryOn.missingImages}
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-card bg-surface p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.tryOn.height} htmlFor="heightCm">
                <input
                  id="heightCm"
                  name="heightCm"
                  type="number"
                  min={130}
                  max={210}
                  defaultValue={162}
                  className="field"
                  required
                />
              </Field>

              <Field label={t.tryOn.weight} htmlFor="weightKg">
                <input
                  id="weightKg"
                  name="weightKg"
                  type="number"
                  min={35}
                  max={150}
                  defaultValue={58}
                  className="field"
                  required
                />
              </Field>
            </div>

            <fieldset>
              <legend className="label">{t.tryOn.skinTone}</legend>
              <div className="flex flex-wrap gap-2">
                {Object.values(SkinTone).map((tone, index) => (
                  <label
                    key={tone}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-2 text-xs
                      transition has-checked:border-primary has-checked:bg-primary-soft"
                  >
                    <input
                      type="radio"
                      name="skinTone"
                      value={tone}
                      defaultChecked={index === 1}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className="size-4 rounded-full border border-black/10"
                      style={{ backgroundColor: SWATCHES[tone] }}
                    />
                    {t.enums.skinTone[tone]}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field
              label={t.tryOn.note}
              htmlFor="bodyNote"
              optional
              hint={t.tryOn.noteHelp}
            >
              <textarea
                id="bodyNote"
                name="bodyNote"
                rows={3}
                maxLength={300}
                className="field"
                placeholder={t.tryOn.notePlaceholder}
              />
            </Field>

            <FormError message={error} />

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? t.tryOn.queued : t.tryOn.submit}
            </Button>

            <p className="text-xs leading-relaxed text-muted">
              {t.tryOn.privacy}
            </p>
          </form>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <RenderPane
                label={t.tryOn.front}
                publicId={render.front}
                loading={status === "front"}
              />
              <RenderPane
                label={t.tryOn.back}
                publicId={render.back}
                loading={status === "back"}
              />
            </div>

            {busy ? (
              <p className="text-center text-xs text-muted">
                {status === "back" ? t.tryOn.generatingBack : t.tryOn.generatingFront}
                {" — "}
                {t.tryOn.waitHint}
              </p>
            ) : null}

            <p className="text-center text-xs leading-relaxed text-muted">
              {t.tryOn.disclaimer}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function RenderPane({
  label,
  publicId,
  loading,
}: {
  label: string;
  publicId: string | null;
  loading: boolean;
}) {
  return (
    <figure className="space-y-2">
      <div className="relative aspect-3/4 overflow-hidden rounded-card border border-border bg-surface">
        {publicId ? (
          <CloudImage
            src={publicId}
            alt={label}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div
            className={`flex h-full items-center justify-center text-xs text-muted ${
              loading ? "animate-pulse bg-subtle" : ""
            }`}
          >
            {loading ? t.tryOn.queued : label}
          </div>
        )}
      </div>
      <figcaption className="text-center text-xs text-muted">{label}</figcaption>
    </figure>
  );
}
