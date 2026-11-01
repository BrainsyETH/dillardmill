"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

export default function Header() {
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const path = usePathname();
  const open = menuPath === path;
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuPath(null);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);
  return (
    <header className="sticky top-0 z-40 border-b border-brand-sand bg-brand-cream">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="page-shell flex h-20 items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="Pine Valley at Dillard Mill home"
          className="shrink-0"
        >
          <Image
            src="/images/pine-valley-logo.png"
            alt="Pine Valley at Dillard Mill"
            width={164}
            height={65}
            priority
            className="h-14 w-28 sm:w-36 object-contain object-left"
          />
        </Link>
        <div className="hidden lg:block">
          <Navigation />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/lodging"
            onClick={() => setMenuPath(null)}
            className="btn btn-primary text-sm px-4"
          >
            Find a stay
          </Link>
          <button
            ref={toggle}
            type="button"
            className="lg:hidden h-11 w-11 flex items-center justify-center"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setMenuPath(open ? null : path)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                d={open ? "M6 6l12 12M18 6L6 18" : "M3 7h18M3 12h18M3 17h18"}
              />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div
          id="mobile-navigation"
          className="lg:hidden page-shell pb-6 max-h-[calc(100dvh-80px)] overflow-y-auto"
        >
          <Navigation mobile onNavigate={() => setMenuPath(null)} />
        </div>
      )}
    </header>
  );
}
