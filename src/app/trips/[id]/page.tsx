'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  ArrowLeft,
  Coffee,
  Utensils,
  Camera,
  Train,
  Bed,
  CheckCircle2,
  DollarSign,
  CheckSquare,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/states';
import { Trip, TripDestination, ItineraryDay, ItineraryItem } from '@/domain/schema';
import { BASELINE_COUNTRIES, BASELINE_CITIES } from '@/domain/baseline-data';
import { BudgetView } from '@/components/trips/budget-view';
import { ChecklistView } from '@/components/trips/checklist-view';
import { MemoriesView } from '@/components/trips/memories-view';

export default function TripDetailPage() {
  const routeParams = useParams();
  const id = (routeParams?.id as string) || '';

  const [trip, setTrip] = useState<Trip | null>(null);
  const [destinations, setDestinations] = useState<TripDestination[]>([]);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'checklist' | 'memories'>('itinerary');

  // Modal Tambah Hari
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [dayTitle, setDayTitle] = useState('');
  const [dayDate, setDayDate] = useState('');
  const [isSubmittingDay, setIsSubmittingDay] = useState(false);

  // Modal Tambah Aktivitas
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const [itemForm, setItemForm] = useState({
    title: '',
    category: 'attraction' as const,
    start_time: '10:00',
    end_time: '12:00',
    location_name: '',
    is_rest_opportunity: false,
    notes: '',
  });

  // Modal Tambah Destinasi
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('jp');
  const [selectedCity, setSelectedCity] = useState('kyoto');
  const [isSubmittingDest, setIsSubmittingDest] = useState(false);

  const fetchTripDetail = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/trips/${id}`);
      if (!res.ok) throw new Error('Gagal memuat detail perjalanan');
      const json = await res.json();
      setTrip(json.data.trip);
      setDestinations(json.data.destinations || []);
      setDays(json.data.days || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTripDetail();
  }, [fetchTripDetail]);

  const handleCreateDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayTitle.trim()) return;

    try {
      setIsSubmittingDay(true);
      const nextDayNumber = days.length + 1;
      const res = await fetch(`/api/trips/${id}/itinerary/days`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_number: nextDayNumber,
          title: dayTitle,
          date: dayDate || undefined,
          pace_mode: trip?.pace_mode || 'relaxed',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Gagal menambahkan hari');
      }

      setDayTitle('');
      setDayDate('');
      setIsDayModalOpen(false);
      await fetchTripDetail();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal membuat hari itinerary');
    } finally {
      setIsSubmittingDay(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDayId || !itemForm.title.trim()) return;

    try {
      setIsSubmittingItem(true);
      const targetDay = days.find((d) => d.id === activeDayId);
      const nextOrder = (targetDay?.items?.length || 0) + 1;

      const res = await fetch(`/api/itinerary/days/${activeDayId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: itemForm.title,
          category: itemForm.category,
          start_time: itemForm.start_time || undefined,
          end_time: itemForm.end_time || undefined,
          location_name: itemForm.location_name || undefined,
          is_rest_opportunity: itemForm.is_rest_opportunity,
          order_index: nextOrder,
          notes: itemForm.notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Gagal menambahkan aktivitas');
      }

      setItemForm({
        title: '',
        category: 'attraction',
        start_time: '10:00',
        end_time: '12:00',
        location_name: '',
        is_rest_opportunity: false,
        notes: '',
      });
      setIsItemModalOpen(false);
      await fetchTripDetail();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal membuat aktivitas');
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingDest(true);
      const res = await fetch(`/api/trips/${id}/destinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_id: selectedCountry,
          city_id: selectedCity,
          order_index: destinations.length,
        }),
      });

      if (!res.ok) throw new Error('Gagal menambahkan destinasi');

      setIsDestModalOpen(false);
      await fetchTripDetail();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menambahkan destinasi');
    } finally {
      setIsSubmittingDest(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Memuat detail rencana perjalanan..." />;
  }

  if (error || !trip) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <ErrorState message={error || 'Perjalanan tidak ditemukan'} onRetry={fetchTripDetail} />
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food':
        return <Utensils className="h-4 w-4 text-amber-700" />;
      case 'rest':
        return <Coffee className="h-4 w-4 text-emerald-700" />;
      case 'transport':
        return <Train className="h-4 w-4 text-blue-700" />;
      case 'hotel':
        return <Bed className="h-4 w-4 text-purple-700" />;
      default:
        return <Camera className="h-4 w-4 text-brand" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back button & Header */}
      <div className="space-y-4">
        <Link
          href="/trips"
          className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Perjalanan
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="priority">Status: {trip.status}</Badge>
              <Badge variant="rest">Ritme: {trip.pace_mode}</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">
              {trip.title}
            </h1>
            <p className="text-sm text-foreground-muted">
              {trip.start_date || 'Tanggal tentatif'} s/d {trip.end_date || 'Tentatif'} • Mata Uang: {trip.base_currency}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDestModalOpen(true)} className="gap-1.5">
              <MapPin className="h-4 w-4" /> Tambah Destinasi
            </Button>
            <Button size="sm" onClick={() => setIsDayModalOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" /> Tambah Hari (Day)
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation Menu */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'itinerary'
              ? 'border-brand text-brand font-semibold'
              : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
          }`}
        >
          <Calendar className="h-4 w-4" /> Timeline Itinerary
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'budget'
              ? 'border-brand text-brand font-semibold'
              : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
          }`}
        >
          <DollarSign className="h-4 w-4" /> Anggaran (Budget)
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'checklist'
              ? 'border-brand text-brand font-semibold'
              : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
          }`}
        >
          <CheckSquare className="h-4 w-4" /> Checklist Kesiapan
        </button>

        <button
          onClick={() => setActiveTab('memories')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'memories'
              ? 'border-brand text-brand font-semibold'
              : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
          }`}
        >
          <BookOpen className="h-4 w-4" /> Jurnal Kenangan
        </button>
      </div>

      {/* Tab Content: 1. ITINERARY */}
      {activeTab === 'itinerary' && (
        <div className="space-y-8">
          {/* Ringkasan Destinasi yang Dikunjungi */}
          <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand" /> Destinasi yang Dikunjungi
            </h2>

            {destinations.length === 0 ? (
              <p className="text-xs text-foreground-muted">Belum ada kota/negara yang ditambahkan ke rute ini.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {destinations.map((d, index) => {
                  const country = BASELINE_COUNTRIES.find((c) => c.id === d.country_id);
                  const city = BASELINE_CITIES.find((c) => c.id === d.city_id);
                  return (
                    <div
                      key={d.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-surface-elevated px-3 py-1.5 border border-border text-xs"
                    >
                      <span className="font-semibold text-brand">Stop {index + 1}:</span>
                      <span className="text-foreground font-medium">{city?.name || d.city_id || 'Kota'}</span>
                      <span className="text-foreground-muted">({country?.name || d.country_id})</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Timeline Hari & Aktivitas */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground font-serif">
                  Timeline Hari Perjalanan (Itinerary)
                </h2>
                <p className="text-xs text-foreground-muted">
                  Rangkaian aktivitas harian dengan waktu istirahat yang transparan
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setIsDayModalOpen(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Tambah Hari Baru
              </Button>
            </div>

            {days.length === 0 ? (
              <EmptyState
                title="Belum Ada Hari Terjadwal"
                description="Tambahkan Hari ke-1 (Day 1) untuk mulai menyusun rangkaian aktivitas santai."
                actionLabel="Tambah Hari Pertama"
                onAction={() => setIsDayModalOpen(true)}
              />
            ) : (
              <div className="space-y-6">
                {days.map((day) => (
                  <Card key={day.id} className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-brand text-white px-2 py-0.5 text-xs font-semibold">
                            Day {day.day_number}
                          </span>
                          <h3 className="text-lg font-bold text-foreground font-serif">{day.title}</h3>
                        </div>
                        {day.date && <span className="text-xs text-foreground-muted">{day.date}</span>}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        onClick={() => {
                          setActiveDayId(day.id);
                          setIsItemModalOpen(true);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" /> Tambah Aktivitas
                      </Button>
                    </div>

                    {/* Aktivitas Harian */}
                    {day.items.length === 0 ? (
                      <p className="text-xs text-foreground-muted italic py-3">
                        Belum ada aktivitas di hari ini. Klik &quot;Tambah Aktivitas&quot; untuk mengisi jadwal.
                      </p>
                    ) : (
                      <div className="space-y-3 pt-2">
                        {day.items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3.5 transition-colors ${
                              item.is_rest_opportunity
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : 'bg-surface-elevated border-border'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 rounded-md bg-surface p-2 border border-border/80">
                                {getCategoryIcon(item.category)}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                                  {item.is_rest_opportunity && (
                                    <Badge variant="rest">Jeda Istirahat Nyaman</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-foreground-muted">
                                  {item.start_time && item.end_time && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" /> {item.start_time} - {item.end_time}
                                    </span>
                                  )}
                                  {item.location_name && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" /> {item.location_name}
                                    </span>
                                  )}
                                </div>
                                {item.notes && (
                                  <p className="text-xs text-foreground-muted leading-relaxed pt-1">
                                    {item.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Tab Content: 2. BUDGET (M4) */}
      {activeTab === 'budget' && (
        <BudgetView tripId={id} />
      )}

      {/* Tab Content: 3. CHECKLIST (M4) */}
      {activeTab === 'checklist' && (
        <ChecklistView tripId={id} />
      )}

      {/* Tab Content: 4. MEMORIES (M5) */}
      {activeTab === 'memories' && (
        <MemoriesView tripId={id} />
      )}

      {/* Modal Tambah Hari */}
      {isDayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground font-serif">
              Tambah Hari Itinerary (Day {days.length + 1})
            </h3>

            <form onSubmit={handleCreateDay} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Judul Hari <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Menikmati Kuil Kinkaku-ji & Sore Santai"
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                  value={dayTitle}
                  onChange={(e) => setDayTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Tanggal
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                  value={dayDate}
                  onChange={(e) => setDayDate(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDayModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmittingDay}>
                  Simpan Hari
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Aktivitas */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground font-serif">
              Tambah Aktivitas ke Itinerary
            </h3>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Nama Aktivitas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Istirahat di Kafe Tradisional & Teh Matcha"
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Kategori</label>
                  <select
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                    value={itemForm.category}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setItemForm({
                        ...itemForm,
                        category: cat,
                        is_rest_opportunity: cat === 'rest' ? true : itemForm.is_rest_opportunity,
                      });
                    }}
                  >
                    <option value="attraction">Atraksi / Wisata</option>
                    <option value="rest">Jeda Istirahat (Rehat)</option>
                    <option value="food">Kuliner / Makan</option>
                    <option value="transport">Transportasi / Transit</option>
                    <option value="hotel">Hotel / Penginapan</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Lokasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Gion District"
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                    value={itemForm.location_name}
                    onChange={(e) => setItemForm({ ...itemForm, location_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Jam Mulai</label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                    value={itemForm.start_time}
                    onChange={(e) => setItemForm({ ...itemForm, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Jam Selesai</label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                    value={itemForm.end_time}
                    onChange={(e) => setItemForm({ ...itemForm, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="restCheck"
                  className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                  checked={itemForm.is_rest_opportunity}
                  onChange={(e) => setItemForm({ ...itemForm, is_rest_opportunity: e.target.checked })}
                />
                <label htmlFor="restCheck" className="text-xs text-foreground cursor-pointer">
                  Tandai sebagai Jeda Istirahat / Rehat Nyaman untuk Ibu
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Catatan / Detail</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Tempat duduk nyaman beratap, dekat toilet ramah lansia."
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                  value={itemForm.notes}
                  onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsItemModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmittingItem}>
                  Simpan Aktivitas
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Destinasi */}
      {isDestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground font-serif">
              Tambah Destinasi ke Rute Perjalanan
            </h3>

            <form onSubmit={handleAddDestination} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Pilih Negara</label>
                <select
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    const cityMatch = BASELINE_CITIES.find((c) => c.country_id === e.target.value);
                    if (cityMatch) setSelectedCity(cityMatch.id);
                  }}
                >
                  {BASELINE_COUNTRIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.is_priority ? '(Prioritas Utama)' : '(Alternatif)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Pilih Kota</label>
                <select
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  {BASELINE_CITIES.filter((c) => c.country_id === selectedCountry).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDestModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmittingDest}>
                  Tambah Destinasi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
