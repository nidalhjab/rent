"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { site } from "@/config/site";
import { endSession, startSession, verifyCredentials } from "@/lib/auth";
import { MINUTE, clearRateLimit, consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { t } from "@/messages/ar";

const credentials = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(200),
});

export type LoginState = { error?: string };

export async function login(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = credentials.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: t.admin.invalid };

  const key = `login:${await getClientIp()}`;
  const allowed = await consumeRateLimit({
    key,
    limit: site.limits.loginAttempts,
    windowMs: 15 * MINUTE,
  });
  if (!allowed) return { error: t.admin.locked };

  const { username, password } = parsed.data;
  if (!(await verifyCredentials(username, password))) {
    return { error: t.admin.invalid };
  }

  await clearRateLimit(key);
  await startSession();
  redirect("/admin/dashboard");
}

export async function logout() {
  await endSession();
  redirect("/admin");
}
