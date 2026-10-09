'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Calendar, Sparkles, Wallet, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { href: '/', label: 'Beranda', icon: Compass },
  { href: '/trips', label: 'Perjalanan', icon: Calendar },
  { href: '/recommendations', label: 'Rekomendasi', icon: Sparkles },
  { href: '/budget', label: 'Anggaran', icon: Wallet },
  { href: '/memories', label: 'Kenangan', icon: BookOpen },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden"
    >
      <div className="grid h-16 grid-cols-5 items-center">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-h-[48px] py-1 text-xs transition-colors',
                isActive ? 'text-brand font-semibold' : 'text-foreground-muted hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 mb-0.5', isActive ? 'text-brand' : 'text-foreground-muted')} />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
