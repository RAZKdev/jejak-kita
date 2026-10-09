'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Plus, Calendar, Image as ImageIcon, Trash2, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/states';
import { Memory } from '@/domain/schema';

interface MemoriesViewProps {
  tripId: string;
}

export function MemoriesView({ tripId }: MemoriesViewProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    caption: '',
    alt_text: '',
    image_url: '',
  });

  const fetchMemories = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/trips/${tripId}/memories`);
      if (!res.ok) throw new Error('Gagal memuat catatan kenangan');
      const data = await res.json();
      setMemories(data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleToggleFavorite = async (memoryId: string) => {
    try {
      const res = await fetch(`/api/memories/${memoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggle_favorite: true }),
      });
      if (!res.ok) throw new Error('Gagal memperbarui status favorit');
      await fetchMemories();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    try {
      setIsSubmitting(true);
      const hasPhoto = form.image_url.trim() || form.alt_text.trim();
      const media = hasPhoto
        ? [
            {
              id: `med-${Date.now()}`,
              memory_id: '',
              storage_path: '/images/memories/placeholder.svg',
              public_url: form.image_url.trim() || undefined,
              caption: form.caption.trim() || undefined,
              alt_text: form.alt_text.trim() || form.title.trim(),
              sort_order: 0,
            },
          ]
        : [];

      const res = await fetch(`/api/trips/${tripId}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          date: form.date,
          content: form.content,
          is_favorite: false,
          media,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || 'Gagal menyimpan catatan kenangan');
      }

      setForm({
        title: '',
        date: new Date().toISOString().split('T')[0],
        content: '',
        caption: '',
        alt_text: '',
        image_url: '',
      });
      setIsModalOpen(false);
      await fetchMemories();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan kenangan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!confirm('Hapus catatan kenangan ini?')) return;
    try {
      const res = await fetch(`/api/memories/${memoryId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      await fetchMemories();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus kenangan');
    }
  };

  if (isLoading) {
    return <LoadingState message="Membuka lembaran kenangan perjalanan..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchMemories} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-brand font-semibold mb-1">
            <BookOpen className="h-4 w-4" /> Jurnal Perjalanan Bersama Ibu
          </div>
          <h3 className="text-xl font-bold text-foreground font-serif">Kenangan & Cerita Berharga</h3>
          <p className="text-xs text-foreground-muted">
            Kumpulan catatan pribadi, momen hening yang berkesan, dan potret perjalanan yang abadi.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Tulis Kenangan Baru
        </Button>
      </div>

      {memories.length === 0 ? (
        <EmptyState
          title="Belum Ada Catatan Kenangan"
          description="Abadikan cerita kebersamaan hangat dan momen tak terlupakan selama perjalanan."
          actionLabel="Tulis Cerita Pertama"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {memories.map((mem) => (
            <Card key={mem.id} className="p-6 md:p-8 space-y-5 bg-surface-elevated border-border">
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-border/80">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-foreground-muted">
                      <Calendar className="h-3.5 w-3.5" /> {mem.date}
                    </span>
                    {mem.is_favorite && (
                      <Badge variant="priority" className="gap-1">
                        <Heart className="h-3 w-3 fill-amber-700 text-amber-700" /> Favorit Keluarga
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-2xl font-bold text-foreground font-serif">{mem.title}</h4>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFavorite(mem.id)}
                    className={`rounded-full p-2 transition-colors ${
                      mem.is_favorite
                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                        : 'text-foreground-muted hover:text-red-600 hover:bg-surface'
                    }`}
                    title={mem.is_favorite ? 'Hapus dari favorit' : 'Tandai sebagai kenangan favorit'}
                  >
                    <Heart className={`h-5 w-5 ${mem.is_favorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleDeleteMemory(mem.id)}
                    className="rounded-full p-2 text-foreground-muted hover:text-red-700 hover:bg-surface transition-colors"
                    title="Hapus kenangan"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Isi Kenangan */}
              <div className="prose prose-stone max-w-none text-foreground leading-relaxed font-serif text-base md:text-lg">
                <p className="whitespace-pre-line">{mem.content}</p>
              </div>

              {/* Foto / Media Kenangan */}
              {mem.media && mem.media.length > 0 && (
                <div className="pt-2 space-y-4">
                  {mem.media.map((med) => {
                    const imgSrc = med.public_url || med.storage_path || '/images/memories/placeholder.svg';
                    return (
                      <div
                        key={med.id}
                        className="overflow-hidden rounded-xl border border-border bg-surface/60 space-y-3"
                      >
                        <div className="relative aspect-video sm:aspect-21/9 w-full bg-surface-elevated overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgSrc}
                            alt={med.alt_text}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-102"
                            onError={(e) => {
                              e.currentTarget.src = '/images/memories/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="p-3 pt-0">
                          {med.caption && (
                            <div className="flex items-center gap-2 text-xs text-brand font-medium">
                              <ImageIcon className="h-3.5 w-3.5" />
                              <span>{med.caption}</span>
                            </div>
                          )}
                          <p className="text-[11px] text-foreground-muted italic leading-relaxed pt-0.5">
                            &quot;{med.alt_text}&quot;
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal Tulis Kenangan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-xl font-bold text-foreground font-serif">Tulis Catatan Kenangan Baru</h3>
              <p className="text-xs text-foreground-muted">
                Ceritakan momen kebersamaan yang bermakna dan berkesan bersama Ibu.
              </p>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Judul Kenangan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Menikmati Sunset di Kuil Kiyomizu-dera"
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tanggal Momen</label>
                <input
                  type="date"
                  required
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Cerita Kenangan (Narasi Personal) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan pengalaman, kesan Ibu, dan suasana yang Anda rasakan bersama..."
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground font-serif"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>

              <div className="rounded-lg border border-border bg-surface p-3.5 space-y-3">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-brand" /> Lampirkan Foto Kenangan (Opsional)
                </span>
                
                <div className="space-y-1">
                  <label className="text-[11px] text-foreground-muted">URL Gambar / Foto</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... atau URL foto"
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-foreground font-mono"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  />
                </div>

                {form.image_url.trim() && (
                  <div className="rounded-lg border border-border overflow-hidden max-h-36 bg-surface-elevated">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.image_url}
                      alt="Pratinjau foto yang diunggah"
                      className="w-full h-36 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/memories/placeholder.svg';
                      }}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] text-foreground-muted">Keterangan Foto (Caption)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ibu tersenyum di pelataran kuil dengan latar lentera"
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-foreground"
                    value={form.caption}
                    onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-foreground-muted">
                    Deskripsi Aksesibilitas (Alt Text)
                  </label>
                  <input
                    type="text"
                    placeholder="Deskripsi visual singkat untuk aksesibilitas"
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-foreground"
                    value={form.alt_text}
                    onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
                  />
                </div>
              </div>


              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Simpan Kenangan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
