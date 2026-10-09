import type { Metadata } from 'next';
import './globals.css';
import { AppNavbar } from '@/components/navigation/navbar';
import { MobileTabBar } from '@/components/navigation/mobile-tab-bar';

export const metadata: Metadata = {
  title: 'Jejak Kita — Perjalanan Rangga & Ibu',
  description: 'Private travel planner & memory journal untuk Rangga dan Ibu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-brand/20">
        <AppNavbar />
        <main className="flex-1 pb-20 md:pb-10">
          {children}
        </main>
        <MobileTabBar />
      </body>
    </html>
  );
}
