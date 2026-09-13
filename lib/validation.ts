import { z } from "zod";
import { site } from "@/config/site";
import { Category, Condition, SkinTone } from "@/lib/generated/prisma/enums";
import { t } from "@/messages/ar";

const v = t.validation;

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((value) => (value ? value : undefined));

const phone = z
  .string()
  .trim()
  .regex(/^[+\d][\d\s-]{7,19}$/, v.phone);

const name = z.string().trim().min(2, v.name).max(80, v.name);

export const itemSubmissionSchema = z.object({
  title: z.string().trim().min(4, v.title).max(120, v.title),
  description: optionalText(1200, v.description),
  category: z.enum(Category, { message: v.category }),
  color: z.string().trim().min(2, v.color).max(40, v.color),
  size: z.string().trim().min(1, v.size).max(12, v.size),
  condition: z.enum(Condition, { message: v.condition }),
  timesWorn: z.coerce.number().int().min(0, v.timesWorn).max(50, v.timesWorn),
  pricePerDay: z.coerce.number().int().min(10, v.price).max(10_000, v.price),
  depositAmount: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(50_000)])
    .optional()
    .transform((value) =>
      value === "" || value === undefined ? undefined : Number(value),
    ),
  city: z.enum(site.cities, { message: v.city }),
  ownerName: name,
  ownerPhone: phone,
  imageFront: z.string().min(1, v.images),
  imageBack: z.string().min(1, v.images),
  imageDetail: z.string().min(1, v.images),
  consent: z.literal("on", { message: v.consent }),
});

export const reservationSchema = z.object({
  itemId: z.string().min(1),
  renterName: name,
  renterPhone: phone,
  note: optionalText(500, v.note),
  preferredDate: z
    .union([z.literal(""), z.coerce.date()])
    .optional()
    .transform((value) =>
      value === "" || value === undefined ? undefined : new Date(value),
    ),
});

export const tryOnSchema = z.object({
  itemId: z.string().min(1),
  heightCm: z.coerce.number().int().min(130, v.height).max(210, v.height),
  weightKg: z.coerce.number().int().min(35, v.weight).max(150, v.weight),
  skinTone: z.enum(SkinTone, { message: v.skinTone }),
  bodyNote: optionalText(300, v.note),
});

export type TryOnInput = z.infer<typeof tryOnSchema>;

/** Shape consumed by `useActionState` in every public form. */
export type FormState = {
  status?: "success";
  error?: string;
  errors?: Record<string, string[] | undefined>;
};

export const fieldErrors = (error: z.ZodError): FormState => ({
  errors: z.flattenError(error).fieldErrors,
});
