// "Sign in with Google" for /admin, limited to Google Workspace addresses
// listed in ADMIN_EMAILS. Standard OpenID Connect authorization-code flow.
//
// The ID token is received directly from Google's token endpoint over TLS in
// exchange for our client secret, so per Google's guidance its claims can be
// trusted without separately verifying the signature; we still check issuer,
// audience, expiry, nonce, verified email and the allowlist.

import { allowedAdminEmails } from "./session";

export const OAUTH_COOKIE = "pv_oauth";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export function googleSignInEnabled(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    allowedAdminEmails().length,
  );
}

export function callbackUrl(origin: string): string {
  return `${origin}/api/admin/google/callback`;
}

export function authorizationUrl(params: {
  origin: string;
  state: string;
  nonce: string;
}): string {
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  url.searchParams.set("redirect_uri", callbackUrl(params.origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email");
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", params.nonce);
  url.searchParams.set("prompt", "select_account");
  // Pre-select the Workspace domain in Google's account chooser (not a security check).
  const domain = allowedAdminEmails()[0]?.split("@")[1];
  if (domain && domain !== "gmail.com") url.searchParams.set("hd", domain);
  return url.toString();
}

export async function exchangeCode(
  code: string,
  origin: string,
): Promise<string> {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: callbackUrl(origin),
      grant_type: "authorization_code",
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const data = (await response.json().catch(() => ({}))) as {
    id_token?: string;
  };
  if (!response.ok || !data.id_token)
    throw new Error("Google did not return an ID token");
  return data.id_token;
}

export function decodeIdToken(idToken: string): Record<string, unknown> {
  const payload = idToken.split(".")[1];
  if (!payload) throw new Error("Malformed ID token");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
}

export type GoogleCheck =
  | { ok: true; email: string }
  | { ok: false; reason: string };

/** Validate ID-token claims and the admin allowlist. Pure, for testing. */
export function checkIdTokenClaims(
  claims: Record<string, unknown>,
  expected: {
    clientId: string;
    nonce: string;
    allowed: string[];
    now?: number;
  },
): GoogleCheck {
  const now = Math.floor((expected.now ?? Date.now()) / 1000);
  if (
    claims.iss !== "https://accounts.google.com" &&
    claims.iss !== "accounts.google.com"
  ) {
    return { ok: false, reason: "wrong issuer" };
  }
  if (claims.aud !== expected.clientId)
    return { ok: false, reason: "wrong audience" };
  if (typeof claims.exp !== "number" || claims.exp < now)
    return { ok: false, reason: "expired" };
  if (claims.nonce !== expected.nonce)
    return { ok: false, reason: "nonce mismatch" };
  if (claims.email_verified !== true || typeof claims.email !== "string") {
    return { ok: false, reason: "email not verified" };
  }
  const email = claims.email.toLowerCase();
  if (!expected.allowed.includes(email))
    return { ok: false, reason: "not an admin" };
  return { ok: true, email };
}
