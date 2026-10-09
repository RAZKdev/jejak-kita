import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BASELINE_COUNTRIES, BASELINE_CITIES } from '@/domain/baseline-data';

export default function DestinationsPage() {
  const priorityCountries = BASELINE_COUNTRIES.filter((c) => c.is_priority);
  const alternativeCountries = BASELINE_COUNTRIES.filter((c) => !c.is_priority);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
          Eksplorasi Destinasi & Kota
        </h1>
        <p className="text-sm text-foreground-muted max-w-3xl leading-relaxed">
          Pilihan destinasi utama dan alternatif yang telah dipetakan dengan karakter kota dan profil aksesibilitas.
        </p>
      </div>

      {/* Prioritas Utama */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge variant="priority">Kelompok Utama</Badge>
          <h2 className="text-xl font-bold text-foreground font-serif">Destinasi Prioritas Utama</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {priorityCountries.map((country) => {
            const cities = BASELINE_CITIES.filter((c) => c.country_id === country.id);
            return (
              <Card key={country.id} className="p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-foreground-muted">{country.code}</span>
                    <span className="text-xs text-foreground-muted">Mata Uang: {country.currency_code}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground font-serif">{country.name}</h3>
                  <p className="text-xs text-foreground-muted">{country.local_name}</p>
                  <p className="text-sm text-foreground-muted leading-relaxed">{country.description}</p>

                  <div className="pt-2 space-y-2">
                    <span className="text-xs font-semibold text-foreground block">Kota Rekomendasi:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {cities.map((city) => (
                        <span
                          key={city.id}
                          className="rounded-md bg-surface px-2 py-1 text-xs text-foreground border border-border"
                        >
                          {city.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-4">
                  <Link href={`/recommendations#${country.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Analisis Kesesuaian
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Alternatif */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Alternatif</Badge>
          <h2 className="text-xl font-bold text-foreground font-serif">Kandidat Destinasi Alternatif</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {alternativeCountries.map((country) => {
            const cities = BASELINE_CITIES.filter((c) => c.country_id === country.id);
            return (
              <Card key={country.id} className="p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-foreground-muted">{country.code}</span>
                    <span className="text-xs text-foreground-muted">{country.currency_code}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-serif">{country.name}</h3>
                  <p className="text-xs text-foreground-muted line-clamp-3 leading-relaxed">
                    {country.description}
                  </p>
                  <div className="pt-1">
                    <span className="text-[11px] text-foreground-muted block mb-1">Kota:</span>
                    <div className="flex flex-wrap gap-1">
                      {cities.map((city) => (
                        <span
                          key={city.id}
                          className="rounded bg-surface px-1.5 py-0.5 text-[11px] text-foreground border border-border/80"
                        >
                          {city.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border mt-2">
                  <Link href={`/recommendations#${country.id}`}>
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      Bandingkan <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
