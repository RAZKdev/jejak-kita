'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Trash2, TrendingUp, PieChart, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/states';
import { BudgetItem, BudgetSummary } from '@/domain/schema';

interface BudgetViewProps {
  tripId: string;
}

export function BudgetView({ tripId }: BudgetViewProps) {
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State Modal Tambah Pengeluaran
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'transport' as const,
    planned_amount: 0,
    actual_amount: 0,
    currency: 'IDR',
    notes: '',
  });

  const fetchBudget = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/trips/${tripId}/budget`);
      if (!res.ok) throw new Error('Gagal memuat anggaran perjalanan');
      const data = await res.json();
      setBudget(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  const handleCreateBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/trips/${tripId}/budget/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          planned_amount: Number(form.planned_amount) || 0,
          actual_amount: Number(form.actual_amount) || 0,
          currency: form.currency,
          notes: form.notes || undefined,
        }),
      });

      if (!res.ok) throw new Error('Gagal menambahkan pos anggaran');

      setForm({
        name: '',
        category: 'transport',
        planned_amount: 0,
        actual_amount: 0,
        currency: 'IDR',
        notes: '',
      });
      setIsModalOpen(false);
      await fetchBudget();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan item anggaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Hapus pos anggaran ini?')) return;
    try {
      const res = await fetch(`/api/budget/items/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus item');
      await fetchBudget();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus item anggaran');
    }
  };

  if (isLoading) {
    return <LoadingState message="Menghitung rincian anggaran perjalanan..." />;
  }

  if (error || !budget) {
    return <ErrorState message={error || 'Gagal memuat anggaran'} onRetry={fetchBudget} />;
  }

  const formatCurrency = (amount: number, curr = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'transport':
        return 'Transportasi';
      case 'lodging':
        return 'Akomodasi / Hotel';
      case 'food':
        return 'Makanan & Minuman';
      case 'activity':
        return 'Atraksi & Tiket';
      case 'shopping':
        return 'Belanja & Cenderamata';
      default:
        return 'Lain-lain';
    }
  };

  const percentageUsed =
    budget.total_planned > 0
      ? Math.round((budget.total_actual / budget.total_planned) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border-border bg-surface-elevated">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Total Direncanakan</span>
            <Wallet className="h-4 w-4 text-brand" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground font-serif">
              {formatCurrency(budget.total_planned, budget.base_currency)}
            </span>
          </div>
          <p className="mt-1 text-xs text-foreground-muted">Estimasi plafon batas biaya perjalanan</p>
        </Card>

        <Card className="p-5 border-border bg-surface-elevated">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Realisasi Aktual</span>
            <TrendingUp className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-foreground font-serif">
              {formatCurrency(budget.total_actual, budget.base_currency)}
            </span>
          </div>
          <p className="mt-1 text-xs text-foreground-muted">
            {percentageUsed}% dari anggaran rencana terpakai
          </p>
        </Card>

        <Card className="p-5 border-border bg-surface-elevated">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground-muted">Sisa Anggaran</span>
            <PieChart className="h-4 w-4 text-blue-700" />
          </div>
          <div className="mt-2">
            <span
              className={`text-2xl font-bold font-serif ${
                budget.total_planned - budget.total_actual >= 0 ? 'text-emerald-800' : 'text-red-700'
              }`}
            >
              {formatCurrency(budget.total_planned - budget.total_actual, budget.base_currency)}
            </span>
          </div>
          <p className="mt-1 text-xs text-foreground-muted">Saldo cadangan yang masih tersedia</p>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-2">
        <div className="flex justify-between text-xs text-foreground font-medium">
          <span>Kesiapan Penggunaan Anggaran</span>
          <span>{percentageUsed}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentageUsed > 100 ? 'bg-red-600' : 'bg-brand'
            }`}
            style={{ width: `${Math.min(100, percentageUsed)}%` }}
          />
        </div>
      </div>

      {/* Item List Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h3 className="text-lg font-bold text-foreground font-serif">Rincian Pos Pengeluaran</h3>
          <p className="text-xs text-foreground-muted">
            Catatan terencana dan aktual per kategori kebutuhan
          </p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Tambah Pos Anggaran
        </Button>
      </div>

      {/* List items */}
      {budget.items.length === 0 ? (
        <EmptyState
          title="Belum Ada Pos Anggaran"
          description="Catat estimasi tiket, hotel, dan biaya makan untuk memantau pengeluaran."
          actionLabel="Tambah Pos Pertama"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface text-foreground-muted">
              <tr>
                <th className="p-3.5 font-semibold">Nama Pos</th>
                <th className="p-3.5 font-semibold">Kategori</th>
                <th className="p-3.5 font-semibold text-right">Rencana</th>
                <th className="p-3.5 font-semibold text-right">Aktual</th>
                <th className="p-3.5 font-semibold text-center w-12">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {budget.items.map((item) => (
                <tr key={item.id} className="hover:bg-surface/40 transition-colors">
                  <td className="p-3.5">
                    <span className="font-semibold text-foreground block">{item.name}</span>
                    {item.notes && <span className="text-[11px] text-foreground-muted">{item.notes}</span>}
                  </td>
                  <td className="p-3.5">
                    <Badge variant="secondary">{getCategoryLabel(item.category)}</Badge>
                  </td>
                  <td className="p-3.5 text-right font-mono text-foreground">
                    {formatCurrency(item.planned_amount, item.currency)}
                  </td>
                  <td className="p-3.5 text-right font-mono font-medium text-brand">
                    {formatCurrency(item.actual_amount, item.currency)}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-foreground-muted hover:text-red-700 transition-colors p-1"
                      title="Hapus pos"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah Pos Anggaran */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground font-serif">Tambah Pos Anggaran</h3>

            <form onSubmit={handleCreateBudgetItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Nama Pos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tiket Kereta Cepat Shinkansen"
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Kategori</label>
                  <select
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  >
                    <option value="transport">Transportasi</option>
                    <option value="lodging">Akomodasi / Hotel</option>
                    <option value="food">Makanan & Kafe</option>
                    <option value="activity">Atraksi / Wisata</option>
                    <option value="shopping">Belanja / Suvenir</option>
                    <option value="miscellaneous">Lain-lain</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Mata Uang</label>
                  <input
                    type="text"
                    maxLength={3}
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground uppercase"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Biaya Rencana</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                    value={form.planned_amount}
                    onChange={(e) => setForm({ ...form, planned_amount: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Biaya Aktual</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                    value={form.actual_amount}
                    onChange={(e) => setForm({ ...form, actual_amount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Catatan / Detail</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Termasuk reservasi bagasi berukuran besar."
                  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Simpan Pos Anggaran
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
