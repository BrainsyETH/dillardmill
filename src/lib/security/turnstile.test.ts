import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyHuman } from "./turnstile";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("Turnstile server verification", () => {
  it("fails closed when production protection is unconfigured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    expect((await verifyHuman("", "booking"))?.status).toBe(503);
  });
  it("requires a token when configured", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
    expect((await verifyHuman("", "booking"))?.status).toBe(400);
  });
  it("rejects an invalid, wrong-action, or wrong-host token", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
    vi.stubEnv("TURNSTILE_ALLOWED_HOSTNAMES", "dillardmill.com");
    for (const result of [
      { success: false },
      { success: true, action: "inquiry", hostname: "dillardmill.com" },
      { success: true, action: "booking", hostname: "attacker.example" },
    ]) {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => Response.json(result)),
      );
      expect((await verifyHuman("test-token", "booking"))?.status).toBe(400);
    }
  });
  it("accepts only a verified token for this action and host", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
    vi.stubEnv("TURNSTILE_ALLOWED_HOSTNAMES", "dillardmill.com");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          success: true,
          action: "booking",
          hostname: "dillardmill.com",
        }),
      ),
    );
    expect(await verifyHuman("test-token", "booking")).toBeNull();
  });
  it("fails closed when Cloudflare is unreachable", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("Offline");
      }),
    );
    expect((await verifyHuman("test-token", "booking"))?.status).toBe(503);
  });
});
