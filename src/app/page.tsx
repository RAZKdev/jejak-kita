import Link from 'next/link';
import { Compass, Calendar, Sparkles, MapPin, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tripRepository } from '@/domain/trips/repository';
import { BASELINE_COUNTRIES } from '@/domain/baseline-data';

export default async function HomePage() {
  const defaultUserId = 'default-user-id';
  const trips = await tripRepository.listTrips(defaultUserId);
  const activeTrip = trips[0];
  const preferences = await tripRepository.getPreferenceProfile(defaultUserId);

  const priorityCountries = BASELINE_COUNTRIES.filter((c) => c.is_priority);
  const alternativeCountries = BASELINE_COUNTRIES.filter((c) => !c.is_priority);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface to-background p-6 md:p-10 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs text-foreground-muted">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <span>Perjalanan Pribadi Rangga & Ibu • Privat & Terpercaya</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl font-serif">
              Rencanakan Perjalanan Nyaman, Simpan Kenangan Berharga
            </h1>

            <p className="text-base text-foreground-muted sm:text-lg leading-relaxed">
              Membantu Rangga dan Ibu membandingkan pilihan destinasi, menyusun itinerary dengan ritme santai,
              dan memastikan kenyamanan setiap langkah perjalanan tanpa rasa terburu-buru.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/trips">
                <Button size="lg" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Lihat Perjalanan
                </Button>
              </Link>
              <Link href="/recommendations">
                <Button variant="outline" size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Eksplor Rekomendasi
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="overflow-hidden rounded-xl border border-border shadow-xs bg-surface-elevated">
              <div className="relative aspect-4/3 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80"
                  alt="Jalur setapak kuil yang damai dan asri di Kyoto, Jepang"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-103"
                  loading="eager"
                />
              </div>
              <div className="p-3 bg-surface/80 border-t border-border">
                <span className="text-[11px] text-foreground-muted block italic">
                  &quot;Ketenangan dan kenyamanan ritme di setiap langkah bersama Ibu.&quot;
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Rencana Perjalanan Aktif */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Perjalanan Dalam Rencana</h2>
            <p className="text-sm text-foreground-muted">Agenda perjalanan yang sedang dipersiapkan saat ini</p>
          </div>
          <Link href="/trips" className="text-xs font-medium text-brand hover:underline flex items-center gap-1">
            Semua Perjalanan <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {activeTrip ? (
          <Card className="hover:border-brand/40 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="priority">Dalam Perencanaan</Badge>
                  <Badge variant="rest">Ritme: Santai (Relaxed)</Badge>
                </div>
                <h3 className="text-2xl font-bold text-foreground font-serif">
                  {activeTrip.title}
                </h3>
                <p className="text-sm text-foreground-muted">
                  {activeTrip.start_date} s/d {activeTrip.end_date} • {activeTrip.notes}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link href={`/trips/${activeTrip.id}`}>
                  <Button variant="primary" className="gap-2">
                    Buka Detail Itinerary <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <p className="text-sm text-foreground-muted">Belum ada rencana perjalanan aktif.</p>
          </Card>
        )}
      </section>

      {/* Profil Kenyamanan & Preferensi */}
      <section className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-surface-elevated p-2 text-brand border border-border">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Profil Kenyamanan Ibu</h3>
              <p className="text-xs text-foreground-muted">Parameter acuan untuk ritme, jalan kaki, dan jeda istirahat</p>
            </div>
          </div>
          <Link href="/preferences">
            <Button variant="outline" size="sm">Ubah Preferensi</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="rounded-lg bg-surface-elevated p-3 border border-border/60">
            <span className="text-[11px] text-foreground-muted block">Ritme Perjalanan</span>
            <span className="text-sm font-semibold text-foreground capitalize">{preferences.pace}</span>
          </div>
          <div className="rounded-lg bg-surface-elevated p-3 border border-border/60">
            <span className="text-[11px] text-foreground-muted block">Intensitas Jalan</span>
            <span className="text-sm font-semibold text-foreground capitalize">{preferences.walking_preference}</span>
          </div>
          <div className="rounded-lg bg-surface-elevated p-3 border border-border/60">
            <span className="text-[11px] text-foreground-muted block">Frekuensi Istirahat</span>
            <span className="text-sm font-semibold text-foreground capitalize">{preferences.rest_frequency}</span>
          </div>
          <div className="rounded-lg bg-surface-elevated p-3 border border-border/60">
            <span className="text-[11px] text-foreground-muted block">Moda Transportasi</span>
            <span className="text-sm font-semibold text-foreground capitalize">Taksi / Privat</span>
          </div>
        </div>
      </section>

      {/* Destinasi Prioritas Utama */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Destinasi Prioritas Utama</h2>
          <p className="text-sm text-foreground-muted">Pilihan target perjalanan teratas berdasarkan keputusan keluarga</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {priorityCountries.map((country) => (
            <Card key={country.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="priority">Prioritas Utama</Badge>
                  <span className="text-xs font-mono text-foreground-muted">{country.code}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground font-serif">
                  {country.name}
                </h3>
                <p className="text-xs text-foreground-muted">
                  {country.local_name} • Mata Uang: {country.currency_code}
                </p>
                <p className="text-sm text-foreground-muted line-clamp-3 leading-relaxed">
                  {country.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <Link href={`/recommendations#${country.id}`} className="text-xs font-medium text-brand hover:underline inline-flex items-center gap-1">
                  Lihat Evaluasi Kesesuaian <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Destinasi Alternatif */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Kandidat Destinasi Alternatif</h2>
          <p className="text-sm text-foreground-muted">Pilihan cadangan atau perjalanan singkat yang tetap nyaman untuk dipertimbangkan</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {alternativeCountries.map((country) => (
            <Card key={country.id} className="p-4 hover:border-brand/40 transition-colors">
              <div className="space-y-1.5">
                <Badge variant="secondary">Alternatif</Badge>
                <h4 className="text-base font-semibold text-foreground font-serif">{country.name}</h4>
                <p className="text-xs text-foreground-muted line-clamp-2">{country.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
