'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

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
      <nav className="flex flex-col space-y-1">
        {navItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={item.href}
              onClick={handleClick}
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                pathname === item.href
                  ? 'bg-brand-forest/10 text-brand-forest'
                  : 'text-brand-charcoal hover:bg-brand-sand/50 hover:text-brand-forest'
              }`}
            >
              {item.label}
            </Link>
          </motion.div>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'text-brand-forest'
                : 'text-brand-charcoal hover:text-brand-forest'
            }`}
          >
            {item.label}
            {isActive && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 bg-brand-forest/10 rounded-lg -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
