"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items = [
  { label: "Stays", href: "/lodging" },
  { label: "Book the Farm", href: "/book-the-farm" },
  { label: "Our place", href: "/our-place" },
  { label: "Nearby", href: "/the-area" },
  { label: "Contact", href: "/contact" },
];
export default function Navigation({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const path = usePathname();
  return (
    <nav
      aria-label="Main navigation"
      className={
        mobile
          ? "flex flex-col divide-y divide-brand-sand"
          : "flex items-center gap-7"
      }
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          aria-current={path === item.href ? "page" : undefined}
          className={`${mobile ? "py-4 text-lg" : "py-3 text-sm"} ${path === item.href ? "underline underline-offset-8" : "hover:underline hover:underline-offset-8"}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
