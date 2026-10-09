import { z } from 'zod';

// ==========================================
// 1. User & Companion
// ==========================================
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().min(1),
  created_at: z.string().datetime().optional(),
});

export const TravelCompanionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  relationship: z.string().default('Ibu'),
  notes: z.string().optional(),
  created_at: z.string().datetime().optional(),
});

// ==========================================
// 2. Preferences (Comfort & Travel Style)
// Sesuai DESIGN.md & CONTENT.md: hanya input eksplisit,
// tidak mengasumsikan/menyimpulkan kondisi medis.
// ==========================================
export const PreferenceProfileSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  pace: z.enum(['relaxed', 'balanced', 'packed']).default('relaxed'),
  walking_preference: z.enum(['minimal', 'moderate', 'extensive']).default('moderate'),
  rest_frequency: z.enum(['frequent', 'moderate', 'minimal']).default('frequent'),
  activity_density: z.enum(['low', 'medium', 'high']).default('low'),
  transport_preference: z.enum(['taxi_private', 'public_transit', 'mixed']).default('taxi_private'),
  day_start_preference: z.enum(['early', 'relaxed_morning']).default('relaxed_morning'),
  interests: z.array(z.string()).default([]),
  food_preferences: z.array(z.string()).default([]),
  shopping_preference: z.enum(['low', 'moderate', 'high']).default('moderate'),
  culture_preference: z.enum(['low', 'moderate', 'high']).default('high'),
  nature_preference: z.enum(['low', 'moderate', 'high']).default('moderate'),
  updated_at: z.string().datetime().optional(),
});

// ==========================================
// 3. Destinations & Places
// Sesuai TRAVEL_DATA_BASELINE.md
// ==========================================
export const CountrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  local_name: z.string().optional(),
  code: z.string().length(2), // ISO 3166-1 alpha-2
  is_priority: z.boolean().default(false), // Japan, South Korea, China
  currency_code: z.string().length(3),
  description: z.string().optional(),
});

export const CitySchema = z.object({
  id: z.string().min(1),
  country_id: z.string().min(1),
  name: z.string().min(1),
  local_name: z.string().optional(),
  is_priority: z.boolean().default(false),
  description: z.string().optional(),
});

export const PlaceSchema = z.object({
  id: z.string().min(1),
  city_id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['attraction', 'nature', 'culture', 'culinary', 'shopping', 'rest_spot', 'transport_hub']),
  walking_intensity: z.enum(['low', 'moderate', 'high']).default('low'),
  typical_duration_minutes: z.number().int().positive().default(60),
  description: z.string().optional(),
});

// ==========================================
// 4. Trip
// ==========================================
export const TripStatusSchema = z.enum([
  'planning',
  'booked',
  'active',
  'completed',
  'archived',
]);

export const TripSchema = z.object({
  id: z.string().uuid(),
  owner_user_id: z.string().uuid(),
  title: z.string().min(1, 'Judul perjalanan wajib diisi'),
  status: TripStatusSchema.default('planning'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').nullable().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').nullable().optional(),
  base_currency: z.string().length(3).default('IDR'),
  pace_mode: z.enum(['relaxed', 'balanced', 'packed']).default('relaxed'),
  notes: z.string().optional().default(''),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const TripDestinationSchema = z.object({
  id: z.string().uuid(),
  trip_id: z.string().uuid(),
  country_id: z.string().min(1),
  city_id: z.string().min(1).optional(),
  order_index: z.number().int().nonnegative().default(0),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  notes: z.string().optional(),
});

// ==========================================
// 5. Itinerary
// ==========================================
export const ItineraryItemCategorySchema = z.enum([
  'attraction',
  'food',
  'transport',
  'rest',
  'shopping',
  'hotel',
  'other',
]);

export const ItineraryItemSchema = z.object({
  id: z.string().uuid(),
  itinerary_day_id: z.string().uuid(),
  place_id: z.string().optional(),
  title: z.string().min(1, 'Nama aktivitas wajib diisi'),
  category: ItineraryItemCategorySchema.default('attraction'),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(), // HH:mm
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional(), // HH:mm
  duration_minutes: z.number().int().positive().nullable().optional(),
  location_name: z.string().optional(),
  order_index: z.number().int().nonnegative().default(0),
  notes: z.string().optional(),
  is_rest_opportunity: z.boolean().default(false),
  reservation_id: z.string().uuid().optional(),
});

export const ItineraryDaySchema = z.object({
  id: z.string().uuid(),
  trip_id: z.string().uuid(),
  day_number: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  title: z.string().min(1, 'Judul hari perjalanan wajib diisi'),
  pace_mode: z.enum(['relaxed', 'balanced', 'packed']).default('relaxed'),
  notes: z.string().optional(),
  items: z.array(ItineraryItemSchema).default([]),
});

// ==========================================
// 6. Reservations & Budget
// ==========================================
export const ReservationSchema = z.object({
  id: z.string().uuid(),
  trip_id: z.string().uuid(),
  type: z.enum(['flight', 'hotel', 'train', 'activity', 'restaurant', 'other']),
  provider_name: z.string().min(1),
  confirmation_code: z.string().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  status: z.enum(['confirmed', 'pending', 'canceled']).default('confirmed'),
  notes: z.string().optional(),
});

export const BudgetItemCategorySchema = z.enum([
  'transport',
  'lodging',
  'food',
  'activity',
  'shopping',
  'miscellaneous',
]);

export const BudgetItemSchema = z.object({
  id: z.string().uuid(),
  trip_id: z.string().uuid(),
  category: BudgetItemCategorySchema,
  name: z.string().min(1),
  planned_amount: z.number().nonnegative().default(0),
  actual_amount: z.number().nonnegative().default(0),
  currency: z.string().length(3).default('IDR'),
  notes: z.string().optional(),
});

export const BudgetSummarySchema = z.object({
  trip_id: z.string().uuid(),
  base_currency: z.string().length(3),
  total_planned: z.number().nonnegative(),
  total_actual: z.number().nonnegative(),
  items: z.array(BudgetItemSchema),
});

// ==========================================
// 7. Checklist
// ==========================================
export const ChecklistItemSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1),
  is_completed: z.boolean().default(false),
  category: z.string().default('General'),
});

export const ChecklistSchema = z.object({
  id: z.string().uuid(),
  trip_id: z.string().uuid(),
  title: z.string().min(1),
  items: z.array(ChecklistItemSchema).default([]),
});

// ==========================================
// 8. Sources & Provenance
// ==========================================
export const SourceSchema = z.object({
  id: z.string().uuid(),
  publisher: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url().optional(),
  published_at: z.string().datetime().optional(),
  accessed_at: z.string().datetime(),
  source_type: z.enum(['official_tourism', 'embassy', 'transit_authority', 'verified_guide', 'personal_note']),
  content_hash: z.string().optional(),
});

export const SourceReferenceSchema = z.object({
  id: z.string().uuid(),
  source_id: z.string().uuid(),
  entity_type: z.enum(['destination', 'place', 'recommendation', 'trip']),
  entity_id: z.string(),
  note: z.string().optional(),
});

// ==========================================
// 9. Recommendation Engine (V1 Deterministic)
// Sesuai RECOMMENDATION_ENGINE.md
// ==========================================
export const RecommendationFactorSchema = z.object({
  factor_name: z.string(),
  score_contribution: z.number(), // -100 to +100
  direction: z.enum(['positive', 'tradeoff', 'neutral']),
  explanation: z.string(),
});

export const RecommendationSchema = z.object({
  id: z.string().uuid(),
  country_id: z.string().min(1),
  city_id: z.string().optional(),
  candidate_name: z.string().min(1),
  is_priority_destination: z.boolean(),
  score: z.number(),
  factors: z.array(RecommendationFactorSchema),
  matched_preferences: z.array(z.string()),
  tradeoffs: z.array(z.string()),
  explanation: z.string(),
  data_freshness: z.string(), // e.g. "Verified 2026-10"
  engine_version: z.string().default('1.0.0-deterministic'),
  status: z.enum(['suggested', 'saved', 'dismissed']).default('suggested'),
  generated_at: z.string().datetime(),
});

// ==========================================
// 10. Memories & Media
// ==========================================
export const MediaReferenceSchema = z.object({
  id: z.string().min(1),
  memory_id: z.string().optional().default(''),
  storage_path: z.string().optional().default('/images/memories/placeholder.svg'),
  public_url: z.string().url().optional(),
  caption: z.string().optional(),
  alt_text: z.string().min(1, 'Alt text wajib diisi untuk aksesibilitas'),
  sort_order: z.number().int().default(0),
});

export const MemorySchema = z.object({
  id: z.string().min(1),
  trip_id: z.string().min(1),
  title: z.string().min(1, 'Judul kenangan wajib diisi'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  content: z.string().min(1, 'Catatan kenangan wajib diisi'),
  is_favorite: z.boolean().default(false),
  media: z.array(MediaReferenceSchema).default([]),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});


// ==========================================
// Infer TypeScript Types from Zod
// ==========================================
export type User = z.infer<typeof UserSchema>;
export type TravelCompanion = z.infer<typeof TravelCompanionSchema>;
export type PreferenceProfile = z.infer<typeof PreferenceProfileSchema>;
export type Country = z.infer<typeof CountrySchema>;
export type City = z.infer<typeof CitySchema>;
export type Place = z.infer<typeof PlaceSchema>;
export type Trip = z.infer<typeof TripSchema>;
export type TripDestination = z.infer<typeof TripDestinationSchema>;
export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;
export type ItineraryItem = z.infer<typeof ItineraryItemSchema>;
export type Reservation = z.infer<typeof ReservationSchema>;
export type BudgetItem = z.infer<typeof BudgetItemSchema>;
export type BudgetSummary = z.infer<typeof BudgetSummarySchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type Checklist = z.infer<typeof ChecklistSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type SourceReference = z.infer<typeof SourceReferenceSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type RecommendationFactor = z.infer<typeof RecommendationFactorSchema>;
export type Memory = z.infer<typeof MemorySchema>;
export type MediaReference = z.infer<typeof MediaReferenceSchema>;
