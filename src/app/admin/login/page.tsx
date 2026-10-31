export const metadata = { title: 'Owner Login | Pine Valley', robots: { index: false } };

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F1EB] px-4">
      <form
        method="post"
        action="/api/admin/login"
        className="w-full max-w-sm bg-white rounded-2xl shadow p-8 space-y-4"
      >
        <h1 className="text-2xl font-serif font-semibold text-[#3A2A1E]">Owner login</h1>
        {error === '1' && <p className="text-sm text-red-700">That password is not correct.</p>}
        {error === 'unset' && (
          <p className="text-sm text-red-700">
            ADMIN_PASSWORD (at least 12 characters) is not configured on the server.
          </p>
        )}
        <input type="hidden" name="next" value={next ?? '/admin'} />
        <label className="block">
          <span className="text-sm text-[#6F8291]">Password</span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-[#CBB8A3] px-3 py-2"
          />
        </label>
        <button className="w-full rounded-lg bg-[#3A2A1E] text-white py-2 font-semibold hover:bg-[#2a1e15]">
          Sign in
        </button>
      </form>
    </div>
  );
}
