'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Plus, MapPin, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/states';
import { Trip } from '@/domain/schema';

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State untuk modal Tambah Perjalanan
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: '',
    pace_mode: 'relaxed',
    notes: '',
  });

  const fetchTrips = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/trips');
      if (!res.ok) throw new Error('Gagal mengambil daftar perjalanan');
      const data = await res.json();
      setTrips(data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
          pace_mode: formData.pace_mode,
          notes: formData.notes,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Gagal membuat perjalanan');
      }

      // Reset form & reload
      setFormData({
        title: '',
        start_date: '',
        end_date: '',
        pace_mode: 'relaxed',
        notes: '',
      });
      setIsModalOpen(false);
      await fetchTrips();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal membuat perjalanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
            Daftar Perjalanan
          </h1>
          <p className="text-sm text-foreground-muted">
            Kelola rencana perjalanan dan jurnal kenangan bersama Ibu
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Rencana Perjalanan
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Memuat daftar rencana perjalanan..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTrips} />
      ) : trips.length === 0 ? (
        <EmptyState
          title="Belum Ada Rencana Perjalanan"
          description="Mulai rencanakan liburan tenang dan nyaman bersama Ibu sekarang."
          actionLabel="Buat Perjalanan Baru"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => (
            <Card key={trip.id} className="flex flex-col justify-between hover:border-brand/40 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={trip.status === 'planning' ? 'priority' : 'secondary'}>
                    {trip.status === 'planning' ? 'Perencanaan' : trip.status}
                  </Badge>
                  <span className="text-xs text-foreground-muted flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Ritme: <span className="capitalize font-medium text-foreground">{trip.pace_mode}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground font-serif">
                    {trip.title}
                  </h3>
                  <p className="text-xs text-foreground-muted">
                    {trip.start_date || 'Tanggal fleksibel'} s/d {trip.end_date || 'Fleksibel'}
                  </p>
                </div>

                {trip.notes && (
                  <p className="text-sm text-foreground-muted leading-relaxed line-clamp-2">
                    {trip.notes}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-border mt-6 flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Mata Uang: {trip.base_currency}</span>
                <Link href={`/trips/${trip.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    Buka Detail <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog Form Buat Perjalanan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground font-serif">
                Buat Rencana Perjalanan Baru
              </h2>
              <p className="text-xs text-foreground-muted">
                Tentukan tujuan awal, tanggal tentatif, dan preferensi ritme perjalanan.
              </p>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Judul Perjalanan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Liburan Musim Gugur di Kyoto & Osaka"
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground focus:border-brand focus:ring-1 focus:ring-brand"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Pace Mode (Ritme Perjalanan)
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                  value={formData.pace_mode}
                  onChange={(e) => setFormData({ ...formData, pace_mode: e.target.value })}
                >
                  <option value="relaxed">Relaxed (Santai — banyak istirahat, max 2 atraksi per hari)</option>
                  <option value="balanced">Balanced (Seimbang — aktivitas teratur dengan jeda kafe)</option>
                  <option value="packed">Packed (Padat — untuk eksplorasi dinamis)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Catatan Tambahan
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Pastikan hotel dekat stasiun dan memiliki lift."
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Simpan Perjalanan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
