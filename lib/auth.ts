import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireEnv } from "@/lib/env";
import { safeEqual, verifyPassword } from "@/lib/password";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  signSession,
  verifySessionToken,
} from "@/lib/session";

export async function verifyCredentials(username: string, password: string) {
  const validUser = safeEqual(username, requireEnv("ADMIN_USERNAME"));
  const validPassword = await verifyPassword(
    password,
    requireEnv("ADMIN_PASSWORD_HASH"),
  );
  return validUser && validPassword;
}

export async function startSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/** Second line of defence behind `proxy.ts`, for pages and Server Actions. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin");
}
