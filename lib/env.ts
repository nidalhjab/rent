/**
 * Read a required server-side variable. Called lazily inside the module that
 * needs it so a missing key surfaces where it matters instead of at import time
 * of an unrelated module.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
