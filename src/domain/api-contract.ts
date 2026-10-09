import { z } from 'zod';
import {
  TripSchema,
  TripDestinationSchema,
  ItineraryDaySchema,
  ItineraryItemSchema,
  PreferenceProfileSchema,
  RecommendationSchema,
  BudgetItemSchema,
  MemorySchema,
} from './schema';

// Standard Error Response sesuai API_CONTRACT.md
export const ApiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
    requestId: z.string(),
  }),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

// Request DTOs
export const CreateTripDtoSchema = TripSchema.omit({
  id: true,
  owner_user_id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateTripDtoSchema = CreateTripDtoSchema.partial();

export const CreateTripDestinationDtoSchema = TripDestinationSchema.omit({
  id: true,
  trip_id: true,
});

export const UpdateTripDestinationDtoSchema = CreateTripDestinationDtoSchema.partial();

export const CreateItineraryDayDtoSchema = ItineraryDaySchema.omit({
  id: true,
  trip_id: true,
  items: true,
});

export const UpdateItineraryDayDtoSchema = CreateItineraryDayDtoSchema.partial();

export const CreateItineraryItemDtoSchema = ItineraryItemSchema.omit({
  id: true,
  itinerary_day_id: true,
});

export const UpdateItineraryItemDtoSchema = CreateItineraryItemDtoSchema.partial();

export const UpdatePreferencesDtoSchema = PreferenceProfileSchema.omit({
  id: true,
  user_id: true,
  updated_at: true,
});

export const CreateBudgetItemDtoSchema = BudgetItemSchema.omit({
  id: true,
  trip_id: true,
});

export const UpdateBudgetItemDtoSchema = CreateBudgetItemDtoSchema.partial();

export const CreateMemoryDtoSchema = MemorySchema.omit({
  id: true,
  trip_id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateMemoryDtoSchema = CreateMemoryDtoSchema.partial();

export const GenerateRecommendationDtoSchema = z.object({
  candidate_type: z.enum(['all', 'priority_only', 'alternatives_only']).default('all'),
  duration_days: z.number().int().positive().optional(),
});
