import { createHash } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import {
  RENDERS_FOLDER,
  fetchImageBase64,
  uploadImageBuffer,
  type StoredImage,
} from "@/lib/cloudinary";
import { requireEnv } from "@/lib/env";
import type { SkinTone } from "@/lib/generated/prisma/enums";

/** Nano Banana 2: fast, cheap, and strong at editing a reference photo. */
export const TRY_ON_MODEL = "gemini-3.1-flash-image";

export type TryOnView = "FRONT" | "BACK";

export type TryOnProfile = {
  heightCm: number;
  weightKg: number;
  skinTone: SkinTone;
  bodyNote?: string;
};

type InteractionInput =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mime_type: string };

const SKIN_TONES: Record<SkinTone, string> = {
  FAIR: "very fair porcelain skin",
  LIGHT: "light beige skin",
  MEDIUM: "medium warm beige skin",
  OLIVE: "olive-toned skin",
  TAN: "tan brown skin",
  DEEP: "deep brown skin",
};

/**
 * Identical measurements must produce the same key so two visitors share one
 * pair of renders instead of paying for two.
 */
export function profileHash(profile: TryOnProfile) {
  const note = (profile.bodyNote ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  return createHash("sha256")
    .update(
      [profile.heightCm, profile.weightKg, profile.skinTone, note].join("|"),
    )
    .digest("hex")
    .slice(0, 32);
}

function silhouette({ heightCm, weightKg }: TryOnProfile) {
  const bmi = weightKg / (heightCm / 100) ** 2;
  if (bmi < 18.5) return "very slim, delicate frame";
  if (bmi < 23) return "slim and balanced frame";
  if (bmi < 27.5) return "average frame with soft curves";
  if (bmi < 32) return "full curvy frame";
  return "plus-size full curvy frame";
}

function stature(heightCm: number) {
  if (heightCm < 155) return "petite";
  if (heightCm <= 168) return "average height";
  return "tall";
}

function buildPrompt(view: TryOnView, profile: TryOnProfile) {
  const facing =
    view === "FRONT"
      ? "seen from the front, facing the camera"
      : "seen from behind, back turned to the camera, face not visible";

  const lines = [
    "Create one modest fashion catalogue photograph.",
    `Put the EXACT garment from the first reference photo on a female model, ${facing}.`,
    "Garment fidelity is the top priority: keep the same colour, fabric, pattern, print, neckline, sleeves, length, and embellishments as the reference. Do not redesign, restyle, or recolour it.",
    `Model: ${profile.heightCm} cm tall (${stature(profile.heightCm)}), ${profile.weightKg} kg, ${silhouette(profile)}, ${SKIN_TONES[profile.skinTone]}.`,
    profile.bodyNote ? `Extra description from the customer: ${profile.bodyNote}.` : "",
    "Framing: full body from head to toe, standing straight and relaxed, plain soft warm-grey studio backdrop, soft even lighting, realistic human proportions, photorealistic.",
    "One person only. No text, no watermark, no logos, no collage, no mirrors, no extra limbs.",
    "Keep the styling modest and respectful.",
    view === "BACK"
      ? "The second reference photo is the same model already rendered from the front: keep the same body, hair, and styling, and show only the back view."
      : "",
  ];

  return lines.filter(Boolean).join("\n");
}

/**
 * One image per call. Each request finishes in seconds instead of minutes,
 * which keeps us inside serverless limits and lets the UI show real progress.
 */
export async function renderTryOnView({
  view,
  profile,
  dressPublicId,
  frontRenderPublicId,
}: {
  view: TryOnView;
  profile: TryOnProfile;
  dressPublicId: string;
  frontRenderPublicId?: string | null;
}): Promise<StoredImage> {
  const ai = new GoogleGenAI({ apiKey: requireEnv("GEMINI_API_KEY") });
  const dress = await fetchImageBase64(dressPublicId);

  const input: InteractionInput[] = [
    { type: "text", text: buildPrompt(view, profile) },
    { type: "image", data: dress.data, mime_type: dress.mimeType },
  ];

  if (view === "BACK" && frontRenderPublicId) {
    const front = await fetchImageBase64(frontRenderPublicId);
    input.push({
      type: "image",
      data: front.data,
      mime_type: front.mimeType,
    });
  }

  const interaction = await ai.interactions.create({
    model: TRY_ON_MODEL,
    input,
    response_format: { type: "image", aspect_ratio: "3:4", image_size: "1K" },
    store: false,
  });

  const image = interaction.output_image;
  if (!image?.data) {
    throw new Error("gemini: interaction returned no image");
  }

  return uploadImageBuffer(Buffer.from(image.data, "base64"), RENDERS_FOLDER);
}
