'use client';

import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, HeartHandshake, ShieldCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { PreferenceProfile } from '@/domain/schema';

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<PreferenceProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchPreferences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/preferences');
      if (!res.ok) throw new Error('Gagal memuat profil preferensi');
      const data = await res.json();
      setPreferences(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences) return;

    try {
      setIsSaving(true);
      setSavedSuccess(false);
      const res = await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!res.ok) throw new Error('Gagal menyimpan preferensi');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan preferensi');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !preferences) {
    return <LoadingState message="Memuat preferensi kenyamanan perjalanan..." />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground-muted">
          <HeartHandshake className="h-3.5 w-3.5 text-brand" />
          <span>Fokus Kenyamanan Perjalanan Ibu</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
          Pengaturan Preferensi Perjalanan
        </h1>
        <p className="text-sm text-foreground-muted leading-relaxed">
          Semua parameter ini diisi berdasarkan preferensi kenyamanan yang Anda dan Ibu sepakati.
          Sistem tidak membuat inferensi kondisi medis apa pun dan semata-mata mengacu pada opsi yang Anda pilih.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Ritme & Jalan Kaki */}
        <Card className="p-6 space-y-4">
          <CardHeader className="mb-0">
            <CardTitle className="text-lg">Ritme & Mobilitas Harian</CardTitle>
            <CardDescription>
              Menentukan kepadatan agenda harian dan toleransi jarak jalan kaki
            </CardDescription>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Ritme Perjalanan (Pace)</label>
              <select
                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                value={preferences.pace}
                onChange={(e) => setPreferences({ ...preferences, pace: e.target.value as any })}
              >
                <option value="relaxed">Relaxed (Santai — banyak istirahat teh, max 2 atraksi per hari)</option>
                <option value="balanced">Balanced (Seimbang — aktivitas teratur dengan jeda nyaman)</option>
                <option value="packed">Packed (Padat)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Intensitas Jalan Kaki</label>
              <select
                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                value={preferences.walking_preference}
                onChange={(e) =>
                  setPreferences({ ...preferences, walking_preference: e.target.value as any })
                }
              >
                <option value="minimal">Minimal (Diutamakan akses datar, lift, dan taksi)</option>
                <option value="moderate">Moderat (Jalan santai di taman / pusat perbelanjaan)</option>
                <option value="extensive">Ekstensif (Eksplorasi jalan kaki jarak jauh)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Frekuensi Istirahat (Rest Frequency)</label>
              <select
                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                value={preferences.rest_frequency}
                onChange={(e) =>
                  setPreferences({ ...preferences, rest_frequency: e.target.value as any })
                }
              >
                <option value="frequent">Sering (Jeda duduk santai setiap 1–2 jam)</option>
                <option value="moderate">Moderat (Jeda istirahat makan siang & sore)</option>
                <option value="minimal">Minimal (Jeda standar)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Moda Transportasi Utama</label>
              <select
                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                value={preferences.transport_preference}
                onChange={(e) =>
                  setPreferences({ ...preferences, transport_preference: e.target.value as any })
                }
              >
                <option value="taxi_private">Taksi / Kendaraan Privat (Paling nyaman & minim jalan)</option>
                <option value="mixed">Kombinasi Taksi & Kereta Cepat</option>
                <option value="public_transit">Transportasi Publik (MRT / Bus)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Minat & Selera */}
        <Card className="p-6 space-y-4">
          <CardHeader className="mb-0">
            <CardTitle className="text-lg">Minat Wisata & Selera Makanan</CardTitle>
            <CardDescription>
              Menyesuaikan jenis kunjungan yang paling dinikmati bersama Ibu
            </CardDescription>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Minat Budaya & Sejarah</label>
              <select
                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                value={preferences.culture_preference}
                onChange={(e) =>
                  setPreferences({ ...preferences, culture_preference: e.target.value as any })
                }
              >
                <option value="high">Sangat Tertarik (Kuil, Istana, Kota Tua)</option>
                <option value="moderate">Cukup Tertarik</option>
                <option value="low">Kurang Tertarik</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Minat Belanja & Oleh-oleh</label>
              <select
                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                value={preferences.shopping_preference}
                onChange={(e) =>
                  setPreferences({ ...preferences, shopping_preference: e.target.value as any })
                }
              >
                <option value="high">Sangat Tertarik (Pasar lokal, cenderamata, mall)</option>
                <option value="moderate">Moderat (Santai)</option>
                <option value="low">Minim Belanja</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Tombol Simpan */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <Check className="h-4 w-4" /> Preferensi berhasil diperbarui!
            </span>
          ) : (
            <span />
          )}

          <Button type="submit" variant="primary" size="lg" isLoading={isSaving}>
            Simpan Perubahan Preferensi
          </Button>
        </div>
      </form>
    </div>
  );
}
