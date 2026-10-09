-- ==============================================================================
-- JEJAK KITA — DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- PostgreSQL / Supabase
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE trip_status AS ENUM ('planning', 'booked', 'active', 'completed', 'archived');
CREATE TYPE pace_mode AS ENUM ('relaxed', 'balanced', 'packed');
CREATE TYPE walking_intensity AS ENUM ('minimal', 'moderate', 'extensive');
CREATE TYPE rest_frequency AS ENUM ('frequent', 'moderate', 'minimal');
CREATE TYPE transport_mode AS ENUM ('taxi_private', 'public_transit', 'mixed');
CREATE TYPE activity_category AS ENUM ('attraction', 'food', 'transport', 'rest', 'shopping', 'hotel', 'other');
CREATE TYPE budget_category AS ENUM ('transport', 'lodging', 'food', 'activity', 'shopping', 'miscellaneous');

-- 3. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 4. PREFERENCE PROFILES (Kenyamanan Ibu)
CREATE TABLE IF NOT EXISTS public.preference_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pace pace_mode DEFAULT 'relaxed' NOT NULL,
    walking_preference walking_intensity DEFAULT 'moderate' NOT NULL,
    rest_frequency rest_frequency DEFAULT 'frequent' NOT NULL,
    activity_density TEXT DEFAULT 'low' NOT NULL,
    transport_preference transport_mode DEFAULT 'taxi_private' NOT NULL,
    day_start_preference TEXT DEFAULT 'relaxed_morning' NOT NULL,
    interests TEXT[] DEFAULT ARRAY[]::TEXT[],
    food_preferences TEXT[] DEFAULT ARRAY[]::TEXT[],
    shopping_preference TEXT DEFAULT 'moderate' NOT NULL,
    culture_preference TEXT DEFAULT 'high' NOT NULL,
    nature_preference TEXT DEFAULT 'moderate' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_user_preference UNIQUE (user_id)
);
ALTER TABLE public.preference_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
    ON public.preference_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. TRIPS
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status trip_status DEFAULT 'planning' NOT NULL,
    start_date DATE,
    end_date DATE,
    base_currency CHAR(3) DEFAULT 'IDR' NOT NULL,
    pace_mode pace_mode DEFAULT 'relaxed' NOT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX idx_trips_owner ON public.trips(owner_user_id);
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trips"
    ON public.trips FOR SELECT
    USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can insert their own trips"
    ON public.trips FOR INSERT
    WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own trips"
    ON public.trips FOR UPDATE
    USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own trips"
    ON public.trips FOR DELETE
    USING (auth.uid() = owner_user_id);

-- 6. TRIP DESTINATIONS
CREATE TABLE IF NOT EXISTS public.trip_destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    country_id TEXT NOT NULL,
    city_id TEXT,
    order_index INT DEFAULT 0 NOT NULL,
    start_date DATE,
    end_date DATE,
    notes TEXT
);
CREATE INDEX idx_destinations_trip ON public.trip_destinations(trip_id);
ALTER TABLE public.trip_destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage destinations of their own trips"
    ON public.trip_destinations FOR ALL
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_destinations.trip_id AND trips.owner_user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_destinations.trip_id AND trips.owner_user_id = auth.uid()));

-- 7. ITINERARY DAYS
CREATE TABLE IF NOT EXISTS public.itinerary_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    date DATE,
    title TEXT NOT NULL,
    pace_mode pace_mode DEFAULT 'relaxed' NOT NULL,
    notes TEXT
);
CREATE INDEX idx_days_trip ON public.itinerary_days(trip_id);
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage days of their own trips"
    ON public.itinerary_days FOR ALL
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = itinerary_days.trip_id AND trips.owner_user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = itinerary_days.trip_id AND trips.owner_user_id = auth.uid()));

-- 8. ITINERARY ITEMS (Termasuk penanda Rest Opportunity untuk Ibu)
CREATE TABLE IF NOT EXISTS public.itinerary_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_day_id UUID NOT NULL REFERENCES public.itinerary_days(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category activity_category DEFAULT 'attraction' NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_minutes INT,
    location_name TEXT,
    order_index INT DEFAULT 0 NOT NULL,
    notes TEXT,
    is_rest_opportunity BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX idx_items_day ON public.itinerary_items(itinerary_day_id);
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage items of their own itinerary"
    ON public.itinerary_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.itinerary_days
        JOIN public.trips ON trips.id = itinerary_days.trip_id
        WHERE itinerary_days.id = itinerary_items.itinerary_day_id
        AND trips.owner_user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.itinerary_days
        JOIN public.trips ON trips.id = itinerary_days.trip_id
        WHERE itinerary_days.id = itinerary_items.itinerary_day_id
        AND trips.owner_user_id = auth.uid()
    ));

-- 9. BUDGET ITEMS (M4)
CREATE TABLE IF NOT EXISTS public.budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    category budget_category NOT NULL,
    name TEXT NOT NULL,
    planned_amount NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    actual_amount NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    currency CHAR(3) DEFAULT 'IDR' NOT NULL,
    notes TEXT
);
CREATE INDEX idx_budget_trip ON public.budget_items(trip_id);
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage budget of their own trips"
    ON public.budget_items FOR ALL
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = budget_items.trip_id AND trips.owner_user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = budget_items.trip_id AND trips.owner_user_id = auth.uid()));

-- 10. CHECKLIST (M4)
CREATE TABLE IF NOT EXISTS public.checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    title TEXT NOT NULL
);
CREATE INDEX idx_checklist_trip ON public.checklists(trip_id);
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage checklists of their own trips"
    ON public.checklists FOR ALL
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = checklists.trip_id AND trips.owner_user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = checklists.trip_id AND trips.owner_user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    category TEXT DEFAULT 'Umum' NOT NULL
);
CREATE INDEX idx_checklist_items ON public.checklist_items(checklist_id);
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage items of their own checklists"
    ON public.checklist_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.checklists
        JOIN public.trips ON trips.id = checklists.trip_id
        WHERE checklists.id = checklist_items.checklist_id
        AND trips.owner_user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.checklists
        JOIN public.trips ON trips.id = checklists.trip_id
        WHERE checklists.id = checklist_items.checklist_id
        AND trips.owner_user_id = auth.uid()
    ));

-- 11. MEMORIES & MEDIA (M5)
CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    content TEXT NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
CREATE INDEX idx_memories_trip ON public.memories(trip_id);
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage memories of their own trips"
    ON public.memories FOR ALL
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = memories.trip_id AND trips.owner_user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = memories.trip_id AND trips.owner_user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.media_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    caption TEXT,
    alt_text TEXT NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL
);
CREATE INDEX idx_media_memory ON public.media_references(memory_id);
ALTER TABLE public.media_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage media of their own memories"
    ON public.media_references FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.memories
        JOIN public.trips ON trips.id = memories.trip_id
        WHERE memories.id = media_references.memory_id
        AND trips.owner_user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.memories
        JOIN public.trips ON trips.id = memories.trip_id
        WHERE memories.id = media_references.memory_id
        AND trips.owner_user_id = auth.uid()
    ));
