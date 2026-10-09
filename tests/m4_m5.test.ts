import { describe, it, expect } from 'vitest';
import { tripRepository } from '@/domain/trips/repository';

describe('Milestone 4: Budget & Checklist Verification', () => {
  const sampleTripId = 'trip-japan-spring-2026';

  it('calculates budget planned vs actual totals correctly', async () => {
    const summary = await tripRepository.getBudgetSummary(sampleTripId);
    expect(summary).toBeDefined();
    expect(summary.trip_id).toBe(sampleTripId);
    expect(summary.total_planned).toBeGreaterThan(0);
    expect(summary.total_actual).toBeGreaterThan(0);
    expect(summary.items.length).toBeGreaterThan(0);
  });

  it('adds, updates, and deletes budget items correctly', async () => {
    // 1. Add
    const createdItem = await tripRepository.addBudgetItem({
      trip_id: sampleTripId,
      category: 'food',
      name: 'Makan Malam Sushi Tradisional',
      planned_amount: 1500000,
      actual_amount: 1400000,
      currency: 'IDR',
      notes: 'Pilihan restoran yang tenang dan mudah diakses',
    });

    expect(createdItem.id).toBeDefined();
    expect(createdItem.name).toBe('Makan Malam Sushi Tradisional');

    // 2. Update
    const updated = await tripRepository.updateBudgetItem(createdItem.id, {
      actual_amount: 1450000,
    });
    expect(updated?.actual_amount).toBe(1450000);

    // 3. Delete
    const deleted = await tripRepository.deleteBudgetItem(createdItem.id);
    expect(deleted).toBe(true);
  });

  it('manages checklist items and completion toggles accurately', async () => {
    const checklist = await tripRepository.getChecklist(sampleTripId);
    expect(checklist).toBeDefined();
    expect(checklist.items.length).toBeGreaterThan(0);

    // Add new item
    const newItem = await tripRepository.addChecklistItem(sampleTripId, {
      text: 'Membawa jaket hangat ekstra untuk Ibu',
      category: 'Pakaian',
      is_completed: false,
    });
    expect(newItem.id).toBeDefined();
    expect(newItem.is_completed).toBe(false);

    // Toggle complete
    const toggled = await tripRepository.toggleChecklistItem(sampleTripId, newItem.id);
    expect(toggled?.is_completed).toBe(true);

    // Delete item
    const deleted = await tripRepository.deleteChecklistItem(sampleTripId, newItem.id);
    expect(deleted).toBe(true);
  });
});

describe('Milestone 5: Memories & Travel Journal Verification', () => {
  const sampleTripId = 'trip-japan-spring-2026';

  it('retrieves personal memories with media and descriptions', async () => {
    const memories = await tripRepository.listMemories(sampleTripId);
    expect(memories.length).toBeGreaterThan(0);

    const firstMemory = memories[0];
    expect(firstMemory.title).toBeDefined();
    expect(firstMemory.content.length).toBeGreaterThan(20); // Narasi personal mendalam
    expect(firstMemory.media.length).toBeGreaterThan(0);
    expect(firstMemory.media[0].alt_text).toBeDefined();
  });

  it('creates, toggles favorite, and deletes a memory', async () => {
    // 1. Create
    const newMemory = await tripRepository.createMemory({
      trip_id: sampleTripId,
      title: 'Melihat Bunga Sakura Gugur Bersama Ibu',
      date: '2026-10-26',
      content: 'Ibu sangat gembira melihat kelopak bunga berguguran perlahan di taman kuil.',
      is_favorite: false,
      media: [
        {
          id: 'media-test-1',
          memory_id: '',
          storage_path: '/images/memories/sakura.webp',
          caption: 'Kelopak sakura di halaman kuil',
          alt_text: 'Ibu memegang kelopak sakura dengan latar kuil kayu klasik',
          sort_order: 0,
        },
      ],
    });

    expect(newMemory.id).toBeDefined();
    expect(newMemory.is_favorite).toBe(false);

    // 2. Toggle favorite
    const toggled = await tripRepository.toggleMemoryFavorite(newMemory.id);
    expect(toggled?.is_favorite).toBe(true);

    // 3. Delete
    const deleted = await tripRepository.deleteMemory(newMemory.id);
    expect(deleted).toBe(true);
  });

  it('retrieves all memories across trips sorted by date', async () => {
    const all = await tripRepository.getAllMemories();
    expect(all.length).toBeGreaterThan(0);
    // Verifikasi pengurutan tanggal menurun
    for (let i = 0; i < all.length - 1; i++) {
      expect(new Date(all[i].date).getTime()).toBeGreaterThanOrEqual(new Date(all[i + 1].date).getTime());
    }
  });
});
