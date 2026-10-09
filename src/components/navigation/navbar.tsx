'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MapPin, Calendar, Sparkles, HeartHandshake, SlidersHorizontal, Wallet, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Beranda', icon: Compass },
  { href: '/trips', label: 'Perjalanan', icon: Calendar },
  { href: '/recommendations', label: 'Rekomendasi', icon: Sparkles },
  { href: '/budget', label: 'Anggaran', icon: Wallet },
  { href: '/memories', label: 'Kenangan', icon: BookOpen },
  { href: '/destinations', label: 'Destinasi', icon: MapPin },
  { href: '/preferences', label: 'Preferensi', icon: SlidersHorizontal },
];

export function AppNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white shadow-sm transition-transform group-hover:scale-105">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-foreground block leading-tight">
                Jejak Kita
              </span>
              <span className="text-[11px] text-foreground-muted block leading-tight">
                Perjalanan Rangga & Ibu
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-surface text-brand font-semibold shadow-xs'
                      : 'text-foreground-muted hover:text-foreground hover:bg-surface/60'
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-brand' : 'text-foreground-muted')} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/preferences"
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground-muted hover:text-foreground transition-colors"
          >
            <HeartHandshake className="h-3.5 w-3.5 text-brand" />
            <span>Kenyamanan Ibu: Santai</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
