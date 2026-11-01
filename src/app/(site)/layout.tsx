import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Public pages are static but read prices and stay switches from the
// database: refresh at least every 5 minutes (admin saves refresh at once).
export const revalidate = 300;

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
