import { googleSignInEnabled } from "@/lib/admin/google";
import { passwordLoginEnabled } from "@/lib/admin/session";

export const metadata = {
  title: "Owner Login | Pine Valley",
  robots: { index: false },
};

const MESSAGES: Record<string, string> = {
  "1": "That password is not correct.",
  unset: "No sign-in method is configured on the server.",
  google:
    "Google sign-in was not accepted. Use an address listed in ADMIN_EMAILS.",
  "google-off": "Google sign-in is not configured.",
};

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const safeNext = next?.startsWith("/admin") ? next : "/admin";
  const google = googleSignInEnabled();
  const password = passwordLoginEnabled();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F1EB] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8 space-y-5">
        <h1 className="text-2xl font-serif font-semibold text-[#3A2A1E]">
          Owner login
        </h1>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {MESSAGES[error] ?? "Sign-in failed."}
          </p>
        )}
        {!google && !password && (
          <p className="text-sm text-red-700">{MESSAGES.unset}</p>
        )}

        {google && (
          <a
            href={`/api/admin/google/start?next=${encodeURIComponent(safeNext)}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#3A2A1E] py-2 font-semibold text-[#3A2A1E] hover:bg-[#F4F1EB]"
          >
            Sign in with Google
          </a>
        )}

        {password && (
          <form method="post" action="/api/admin/login" className="space-y-4">
            {google && (
              <p className="text-center text-xs text-[#6F8291]">
                or use the shared password
              </p>
            )}
            <input type="hidden" name="next" value={safeNext} />
            <label className="block">
              <span className="text-sm text-[#6F8291]">Password</span>
              <input
                type="password"
                name="password"
                required
                autoFocus={!google}
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-[#CBB8A3] px-3 py-2"
              />
            </label>
            <button className="w-full rounded-lg bg-[#3A2A1E] text-white py-2 font-semibold hover:bg-[#2a1e15]">
              Sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
