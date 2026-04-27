import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EmbedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // min-h-dvh keeps map embeds covering the viewport while letting the
  // booking embed grow taller than the viewport — the parent iframe
  // listens for postMessage resize events to match.
  return <div className="min-h-dvh w-full">{children}</div>;
}
