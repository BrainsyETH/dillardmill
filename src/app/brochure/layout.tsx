import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pine Valley at Dillard Mill - Brochure",
  robots: "noindex, nofollow",
};

export default function BrochureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        header, footer, nav { display: none !important; }
        main { padding: 0 !important; margin: 0 !important; }
        body { background: white !important; }
        .flex.flex-col.min-h-screen { min-height: auto !important; }
      `}</style>
      {children}
    </>
  );
}
