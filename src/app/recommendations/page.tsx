'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, SlidersHorizontal, AlertCircle, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { Recommendation } from '@/domain/schema';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<'all' | 'priority_only' | 'alternatives_only'>('all');
  const [durationDays, setDurationDays] = useState<number>(7);

  const fetchRecommendations = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_type: filterType,
          duration_days: durationDays,
        }),
      });

      if (!res.ok) throw new Error('Gagal menghasilkan rekomendasi');
      const data = await res.json();
      setRecommendations(data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  }, [filterType, durationDays]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground-muted">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          <span>Mesin Rekomendasi V1 • Deterministik & Berlandaskan Preferensi Nyata</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
          Eksplorasi Rekomendasi Destinasi
        </h1>
        <p className="text-sm text-foreground-muted max-w-3xl leading-relaxed">
          Rekomendasi disusun transparan dengan mencocokkan preferensi kenyamanan Ibu terhadap karakteristik destinasi.
          Sistem menyajikan faktor kesesuaian dan pertimbangan <em>trade-off</em> agar keputusan tetap berada di tangan Anda.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-foreground-muted mr-1">Kategori:</span>
          <Button
            size="sm"
            variant={filterType === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilterType('all')}
            className="text-xs"
          >
            Semua Destinasi
          </Button>
          <Button
            size="sm"
            variant={filterType === 'priority_only' ? 'primary' : 'outline'}
            onClick={() => setFilterType('priority_only')}
            className="text-xs"
          >
            Prioritas Utama Saja
          </Button>
          <Button
            size="sm"
            variant={filterType === 'alternatives_only' ? 'primary' : 'outline'}
            onClick={() => setFilterType('alternatives_only')}
            className="text-xs"
          >
            Alternatif Saja
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-foreground-muted">Durasi Perjalanan:</span>
          <select
            className="rounded-lg border border-border bg-surface-elevated px-2.5 py-1.5 text-xs text-foreground"
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
          >
            <option value={5}>5 Hari (Singkat)</option>
            <option value={7}>7 Hari (Standar)</option>
            <option value={10}>10 Hari (Ideal Santai)</option>
            <option value={14}>14 Hari (Eksplorasi Luas)</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState message="Menghitung faktor kesesuaian dan trade-off destinasi..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRecommendations} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <Card
              key={rec.id}
              id={rec.country_id}
              className="flex flex-col justify-between hover:border-brand/40 transition-colors"
            >
              <div className="space-y-4">
                {/* Header card */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={rec.is_priority_destination ? 'priority' : 'secondary'}>
                        {rec.is_priority_destination ? 'Prioritas Utama' : 'Alternatif'}
                      </Badge>
                      <span className="text-xs text-foreground-muted font-mono">
                        Skor Kecocokan: {rec.score}%
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground font-serif">
                      {rec.candidate_name}
                    </h3>
                  </div>
                </div>

                {/* Penjelasan Transparan */}
                <p className="text-sm text-foreground-muted leading-relaxed">
                  {rec.explanation}
                </p>

                {/* Faktor Kecocokan */}
                {rec.matched_preferences.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Faktor yang Sangat Mendukung:
                    </span>
                    <ul className="list-disc list-inside text-xs text-foreground-muted space-y-0.5 pl-1">
                      {rec.matched_preferences.map((match, idx) => (
                        <li key={idx}>{match}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Trade-offs */}
                {rec.tradeoffs.length > 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 space-y-1 text-xs text-amber-900">
                    <span className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-700" />
                      Pertimbangan & Trade-off:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 pl-1 text-amber-800">
                      {rec.tradeoffs.map((to, idx) => (
                        <li key={idx}>{to}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer provenance */}
              <div className="pt-4 border-t border-border mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-foreground-muted">
                <span className="flex items-center gap-1">
                  <Info className="h-3 w-3" /> {rec.data_freshness} • Versi {rec.engine_version}
                </span>
                <span className="font-medium text-brand">Keputusan akhir ada di tangan keluarga</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
