import { NextResponse } from "next/server";

/** Verify before any database mutation or payment authorization. Fail closed in production. */
export async function verifyHuman(
  token: unknown,
  action: "inquiry" | "booking",
): Promise<NextResponse | null> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret)
    return process.env.NODE_ENV === "production"
      ? NextResponse.json(
          {
            error:
              "Online requests are temporarily unavailable. Please call (314) 843-4321.",
          },
          { status: 503 },
        )
      : null;
  if (typeof token !== "string" || !token || token.length > 2048)
    return NextResponse.json(
      { error: "Please complete the security check and try again." },
      { status: 400 },
    );
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({ secret, response: token }),
        signal: AbortSignal.timeout(8000),
      },
    );
    const result = await response.json();
    const hostname = new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://dillardmill.com",
    ).hostname;
    const allowedHosts = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || hostname)
      .split(",")
      .map((h) => h.trim());
    if (
      !response.ok ||
      !result.success ||
      result.action !== action ||
      !allowedHosts.includes(result.hostname)
    )
      return NextResponse.json(
        {
          error:
            "The security check expired or could not be verified. Please try again.",
        },
        { status: 400 },
      );
    return null;
  } catch {
    return NextResponse.json(
      {
        error:
          "The security check is unavailable. Please try again, or call (314) 843-4321.",
      },
      { status: 503 },
    );
  }
}
