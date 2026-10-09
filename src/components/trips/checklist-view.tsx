'use client';

import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/states';
import { Checklist, ChecklistItem } from '@/domain/schema';

interface ChecklistViewProps {
  tripId: string;
}

export function ChecklistView({ tripId }: ChecklistViewProps) {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Dokumen');
  const [isAdding, setIsAdding] = useState(false);

  const fetchChecklist = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/trips/${tripId}/checklist`);
      if (!res.ok) throw new Error('Gagal memuat daftar kelengkapan perjalanan');
      const data = await res.json();
      setChecklist(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const handleToggle = async (itemId: string) => {
    // Optimistic UI update
    if (!checklist) return;
    const updatedItems = checklist.items.map((item) =>
      item.id === itemId ? { ...item, is_completed: !item.is_completed } : item
    );
    setChecklist({ ...checklist, items: updatedItems });

    try {
      const res = await fetch(`/api/checklist/items/${itemId}?tripId=${tripId}`, {
        method: 'PATCH',
      });
      if (!res.ok) throw new Error('Gagal memperbarui status');
    } catch (err: unknown) {
      // Revert if error
      await fetchChecklist();
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    try {
      setIsAdding(true);
      const res = await fetch(`/api/trips/${tripId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newItemText,
          category: newItemCategory,
          is_completed: false,
        }),
      });

      if (!res.ok) throw new Error('Gagal menambahkan item');
      setNewItemText('');
      await fetchChecklist();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menambahkan kelengkapan');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/checklist/items/${itemId}?tripId=${tripId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Gagal menghapus item');
      await fetchChecklist();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus item');
    }
  };

  if (isLoading) {
    return <LoadingState message="Memuat daftar kesiapan perjalanan..." />;
  }

  if (error || !checklist) {
    return <ErrorState message={error || 'Gagal memuat checklist'} onRetry={fetchChecklist} />;
  }

  const completedCount = checklist.items.filter((i) => i.is_completed).length;
  const totalCount = checklist.items.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Kelompokkan per kategori
  const categories = Array.from(new Set(checklist.items.map((i) => i.category || 'Umum')));

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="p-6 border-border bg-surface-elevated space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-foreground font-serif">{checklist.title}</h3>
            <p className="text-xs text-foreground-muted">
              Pastikan seluruh dokumen, obat-obatan, dan perlengkapan kenyamanan Ibu telah siap.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-brand">
              {completedCount} / {totalCount} Selesai ({completionPercentage}%)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </Card>

      {/* Form Tambah Item Cepat */}
      <Card className="p-4 bg-surface border-border">
        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            required
            placeholder="Tambah perlengkapan baru... (Contoh: Balsem hangat cadangan)"
            className="flex-1 w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground focus:border-brand"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
          />

          <select
            className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
          >
            <option value="Dokumen">Dokumen</option>
            <option value="Kesehatan">Kesehatan</option>
            <option value="Kenyamanan">Kenyamanan</option>
            <option value="Pakaian">Pakaian</option>
            <option value="Elektronik">Elektronik</option>
            <option value="Transportasi">Transportasi</option>
            <option value="Umum">Umum</option>
          </select>

          <Button type="submit" variant="primary" size="md" isLoading={isAdding} className="w-full sm:w-auto gap-1.5 whitespace-nowrap">
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </form>
      </Card>

      {/* Grouped Checklist */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const catItems = checklist.items.filter((i) => (i.category || 'Umum') === cat);
          return (
            <div key={cat} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{cat}</Badge>
                <span className="text-xs text-foreground-muted">
                  ({catItems.filter((i) => i.is_completed).length}/{catItems.length})
                </span>
              </div>

              <div className="divide-y divide-border rounded-xl border border-border bg-surface-elevated overflow-hidden">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 hover:bg-surface/50 transition-colors"
                  >
                    <label
                      onClick={() => handleToggle(item.id)}
                      className="flex items-center gap-3 cursor-pointer select-none flex-1"
                    >
                      {item.is_completed ? (
                        <CheckSquare className="h-5 w-5 text-brand" />
                      ) : (
                        <Square className="h-5 w-5 text-foreground-muted" />
                      )}
                      <span
                        className={`text-sm ${
                          item.is_completed
                            ? 'line-through text-foreground-muted'
                            : 'text-foreground font-medium'
                        }`}
                      >
                        {item.text}
                      </span>
                    </label>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-foreground-muted hover:text-red-700 transition-colors p-1"
                      title="Hapus perlengkapan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
