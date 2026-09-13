import { SignJWT, jwtVerify } from "jose";
import { requireEnv } from "@/lib/env";

export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

const secret = () => new TextEncoder().encode(requireEnv("AUTH_SECRET"));

export const signSession = () =>
  new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secret());

/** Kept free of `next/headers` so `proxy.ts` can use it too. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: ["HS256"],
    });
    return payload.sub === "admin";
  } catch {
    return false;
  }
}
