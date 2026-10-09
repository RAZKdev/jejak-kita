import React from 'react';
import Link from 'next/link';
import { Wallet, ArrowRight, DollarSign, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { tripRepository } from '@/domain/trips/repository';
import { BudgetView } from '@/components/trips/budget-view';

export default async function GlobalBudgetPage() {
  const defaultUserId = 'default-user-id';
  const trips = await tripRepository.listTrips(defaultUserId);
  const activeTrip = trips[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs text-brand font-semibold mb-1">
          <Wallet className="h-4 w-4" /> Manajemen Keuangan & Anggaran
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
          Plafon & Realisasi Anggaran Perjalanan
        </h1>
        <p className="text-sm text-foreground-muted max-w-3xl leading-relaxed">
          Pantau batas rencana pengeluaran transportasi, hotel, makan, dan belanja secara transparan agar liburan tetap tenang dan terkontrol.
        </p>
      </div>

      {activeTrip ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
            <div>
              <span className="text-xs text-foreground-muted">Menampilkan Anggaran untuk:</span>
              <h2 className="text-xl font-bold text-foreground font-serif">{activeTrip.title}</h2>
            </div>
            <Link href={`/trips/${activeTrip.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                Lihat di Detail Perjalanan <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <BudgetView tripId={activeTrip.id} />
        </div>
      ) : (
        <Card className="p-8 text-center text-foreground-muted">
          <p className="text-sm">Belum ada perjalanan aktif untuk melihat anggaran.</p>
        </Card>
      )}
    </div>
  );
}
