import { v2 as cloudinary } from "cloudinary";
import { requireEnv } from "@/lib/env";

/** Visitor uploads land here; approved and pending items share the folder. */
export const ITEMS_FOLDER = "labsa/items";
/** AI try-on output, kept apart so it can be pruned independently. */
export const RENDERS_FOLDER = "labsa/renders";

let configured = false;

/** Configured on first use so a missing key never breaks an unrelated import. */
function client() {
  if (!configured) {
    cloudinary.config({
      cloud_name: requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
      api_key: requireEnv("CLOUDINARY_API_KEY"),
      api_secret: requireEnv("CLOUDINARY_API_SECRET"),
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export type SignedUpload = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
};

/**
 * Browsers upload straight to Cloudinary, which keeps multi-megabyte photos out
 * of the Server Action body limit. The folder is fixed here, never client-sent.
 */
export function signUpload(): SignedUpload {
  const api = client();
  const timestamp = Math.round(Date.now() / 1000);
  const signature = api.utils.api_sign_request(
    { folder: ITEMS_FOLDER, timestamp },
    requireEnv("CLOUDINARY_API_SECRET"),
  );

  return {
    cloudName: requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    apiKey: requireEnv("CLOUDINARY_API_KEY"),
    folder: ITEMS_FOLDER,
    timestamp,
    signature,
  };
}

export type StoredImage = { publicId: string; width: number; height: number };

/**
 * Confirms a client-reported `public_id` really exists in our items folder and
 * reads its true dimensions, so the form can't fabricate either.
 */
export async function verifyUploadedImage(
  publicId: string,
): Promise<StoredImage | null> {
  if (!publicId.startsWith(`${ITEMS_FOLDER}/`)) return null;

  try {
    const resource = await client().api.resource(publicId, {
      resource_type: "image",
    });
    if (!resource.width || !resource.height) return null;
    return {
      publicId: resource.public_id,
      width: resource.width,
      height: resource.height,
    };
  } catch {
    return null;
  }
}

export async function deleteImages(publicIds: string[]) {
  const ids = publicIds.filter(Boolean);
  if (ids.length === 0) return;

  try {
    await client().api.delete_resources(ids, { resource_type: "image" });
  } catch (error) {
    // Orphaned assets are cheap; failing an admin action over them is not.
    console.error("cloudinary: failed to delete assets", error);
  }
}

export async function uploadImageBuffer(
  buffer: Buffer,
  folder: string,
): Promise<StoredImage> {
  const api = client();

  return new Promise((resolve, reject) => {
    const stream = api.uploader.upload_stream(
      { folder, resource_type: "image", format: "webp" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("cloudinary: empty upload result"));
          return;
        }
        resolve({
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      },
    );
    stream.end(buffer);
  });
}

/** Server-side fetch of a stored asset, used to feed reference photos to Gemini. */
export async function fetchImageBase64(publicId: string) {
  const url = client().url(publicId, {
    secure: true,
    transformation: [{ width: 1024, crop: "limit", quality: "auto" }],
  });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`cloudinary: could not fetch ${publicId}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    data: buffer.toString("base64"),
    mimeType: response.headers.get("content-type") ?? "image/jpeg",
  };
}
