import { describe, it, expect } from 'vitest';
import {
  PreferenceProfileSchema,
  TripSchema,
  ItineraryDaySchema,
  ItineraryItemSchema,
  BudgetItemSchema,
} from '@/domain/schema';
import {
  evaluateDestination,
  generateRecommendations,
} from '@/domain/recommendation-engine';
import { BASELINE_COUNTRIES } from '@/domain/baseline-data';

describe('Domain Models Validation', () => {
  it('should validate a default preference profile correctly', () => {
    const validProfile = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      pace: 'relaxed',
      walking_preference: 'moderate',
      rest_frequency: 'frequent',
      activity_density: 'low',
      transport_preference: 'taxi_private',
      day_start_preference: 'relaxed_morning',
      interests: ['nature', 'culture'],
      food_preferences: ['halal'],
      shopping_preference: 'moderate',
      culture_preference: 'high',
      nature_preference: 'moderate',
    };

    const parsed = PreferenceProfileSchema.parse(validProfile);
    expect(parsed.pace).toBe('relaxed');
    expect(parsed.food_preferences).toContain('halal');
  });

  it('should validate trip creation schema with valid dates and status', () => {
    const validTrip = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      owner_user_id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Perjalanan Jepang Santai Bersama Ibu',
      status: 'planning',
      start_date: '2026-11-01',
      end_date: '2026-11-10',
      base_currency: 'IDR',
      pace_mode: 'relaxed',
      notes: 'Fokus kuil dan taman di Kyoto dan Tokyo.',
    };

    const parsed = TripSchema.parse(validTrip);
    expect(parsed.title).toBe('Perjalanan Jepang Santai Bersama Ibu');
    expect(parsed.status).toBe('planning');
  });

  it('should fail trip validation when title is empty', () => {
    const invalidTrip = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      owner_user_id: '123e4567-e89b-12d3-a456-426614174000',
      title: '',
      status: 'planning',
    };

    expect(() => TripSchema.parse(invalidTrip)).toThrow();
  });

  it('should validate itinerary day and items structure', () => {
    const validItem = {
      id: '123e4567-e89b-12d3-a456-426614174003',
      itinerary_day_id: '123e4567-e89b-12d3-a456-426614174002',
      title: 'Istirahat di Kafe Tradisional',
      category: 'rest',
      start_time: '14:00',
      end_time: '15:30',
      duration_minutes: 90,
      is_rest_opportunity: true,
      order_index: 2,
    };

    const parsedItem = ItineraryItemSchema.parse(validItem);
    expect(parsedItem.is_rest_opportunity).toBe(true);
    expect(parsedItem.category).toBe('rest');

    const validDay = {
      id: '123e4567-e89b-12d3-a456-426614174002',
      trip_id: '123e4567-e89b-12d3-a456-426614174001',
      day_number: 1,
      date: '2026-11-02',
      title: 'Hari Pertama di Kyoto',
      pace_mode: 'relaxed',
      items: [parsedItem],
    };

    const parsedDay = ItineraryDaySchema.parse(validDay);
    expect(parsedDay.day_number).toBe(1);
    expect(parsedDay.items.length).toBe(1);
  });
});

describe('Recommendation Engine V1 (Deterministic)', () => {
  const mockPreferences = {
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    pace: 'relaxed' as const,
    walking_preference: 'minimal' as const,
    rest_frequency: 'frequent' as const,
    activity_density: 'low' as const,
    transport_preference: 'taxi_private' as const,
    day_start_preference: 'relaxed_morning' as const,
    interests: ['culture'],
    food_preferences: ['halal'],
    shopping_preference: 'moderate' as const,
    culture_preference: 'high' as const,
    nature_preference: 'moderate' as const,
  };

  it('should evaluate destinations deterministically with reasons and trade-offs', () => {
    const japan = BASELINE_COUNTRIES.find((c) => c.id === 'jp')!;
    const rec = evaluateDestination({
      destination: japan,
      preferences: mockPreferences,
      duration_days: 8,
    });

    expect(rec.candidate_name).toBe('Jepang');
    expect(rec.is_priority_destination).toBe(true);
    expect(rec.score).toBeGreaterThan(0);
    expect(rec.factors.length).toBeGreaterThan(0);
    // Walking preference minimal on Japan should trigger a constructive trade-off note
    expect(rec.tradeoffs.length).toBeGreaterThan(0);
    expect(rec.explanation).not.toContain('AI says');
  });

  it('should generate recommendations list correctly sorted', () => {
    const recommendations = generateRecommendations(mockPreferences, 'all', 7);
    expect(recommendations.length).toBe(BASELINE_COUNTRIES.length);
    // Verifikasi urutan skor menurun
    for (let i = 0; i < recommendations.length - 1; i++) {
      expect(recommendations[i].score).toBeGreaterThanOrEqual(recommendations[i + 1].score);
    }
  });

  it('should filter candidate types (priority_only vs alternatives_only)', () => {
    const priorityOnly = generateRecommendations(mockPreferences, 'priority_only');
    expect(priorityOnly.every((r) => r.is_priority_destination)).toBe(true);
    expect(priorityOnly.length).toBe(3); // JP, KR, CN

    const alternativesOnly = generateRecommendations(mockPreferences, 'alternatives_only');
    expect(alternativesOnly.every((r) => !r.is_priority_destination)).toBe(true);
    expect(alternativesOnly.length).toBe(4); // SG, MY, TW, TH
  });
});
