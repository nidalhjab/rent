import { NextResponse } from "next/server";
import { signUpload } from "@/lib/cloudinary";
import { HOUR, consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { t } from "@/messages/ar";

/** One signature per photo; 30/hour is far above an honest submission flow. */
const SIGNATURES_PER_HOUR = 30;

export async function POST() {
  const allowed = await consumeRateLimit({
    key: `upload-sign:${await getClientIp()}`,
    limit: SIGNATURES_PER_HOUR,
    windowMs: HOUR,
  });

  if (!allowed) {
    return NextResponse.json({ error: t.form.tooMany }, { status: 429 });
  }

  return NextResponse.json(signUpload());
}
