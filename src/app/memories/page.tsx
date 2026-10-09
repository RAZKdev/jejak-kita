import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tripRepository } from '@/domain/trips/repository';
import { MemoriesView } from '@/components/trips/memories-view';

export default async function GlobalMemoriesPage() {
  const defaultUserId = 'default-user-id';
  const trips = await tripRepository.listTrips(defaultUserId);
  const activeTrip = trips[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs text-brand font-semibold mb-1">
          <BookOpen className="h-4 w-4" /> Jurnal & Kenangan Pribadi
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
          Jejak Kenangan Rangga & Ibu
        </h1>
        <p className="text-sm text-foreground-muted max-w-3xl leading-relaxed">
          Catatan cerita hangat, momen berharga yang menenangkan, dan kenangan indah yang diabadikan dari setiap langkah perjalanan.
        </p>
      </div>

      {activeTrip ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
            <div>
              <span className="text-xs text-foreground-muted">Jurnal Perjalanan:</span>
              <h2 className="text-xl font-bold text-foreground font-serif">{activeTrip.title}</h2>
            </div>
            <Link href={`/trips/${activeTrip.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                Buka di Detail Trip <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <MemoriesView tripId={activeTrip.id} />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-foreground-muted">
          Belum ada perjalanan untuk menyimpan kenangan.
        </div>
      )}
    </div>
  );
}
