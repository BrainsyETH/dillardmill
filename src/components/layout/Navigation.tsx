'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Lodging', href: '/lodging' },
  { label: 'Photos', href: '/photos' },
  { label: 'The Area', href: '/the-area' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Thoughts', href: '/thoughts' },
  { label: 'Contact', href: '/contact' },
];

export default function Navigation({ mobile = false, onNavigate }: NavigationProps) {
  const pathname = usePathname();

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  if (mobile) {
    return (
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleClick}
            className={`px-4 py-2 rounded-md text-base font-medium transition-colors ${
              pathname === item.href
                ? 'bg-[#9C5A3C]/10 text-[#9C5A3C]'
                : 'text-[#2B2B2B] hover:bg-[#CBB8A3]/20 hover:text-[#3A2A1E]'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            pathname === item.href
              ? 'text-[#9C5A3C] bg-[#9C5A3C]/10'
              : 'text-[#2B2B2B] hover:text-[#3A2A1E] hover:bg-[#CBB8A3]/20'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
