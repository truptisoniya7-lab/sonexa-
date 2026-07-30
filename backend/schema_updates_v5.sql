-- ==========================================
-- SONEXA SCHEMA V5 (Personalization Engine)
-- ==========================================

-- 1. NORMALIZED ENTITIES
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.genres (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ENHANCED LISTENING HISTORY
CREATE TABLE IF NOT EXISTS public.user_listening_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL,
    track_title TEXT NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    genre_id UUID REFERENCES public.genres(id) ON DELETE SET NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_listened INT DEFAULT 0,
    total_duration INT DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    skipped BOOLEAN DEFAULT false,
    liked BOOLEAN DEFAULT false,
    context TEXT -- e.g., 'room', 'search', 'home'
);

CREATE INDEX IF NOT EXISTS idx_listening_history_user ON public.user_listening_history (user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_listening_history_artist ON public.user_listening_history (artist_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_genre ON public.user_listening_history (genre_id);

-- 3. TASTE PROFILES
CREATE TABLE IF NOT EXISTS public.user_taste_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    top_artist_ids JSONB DEFAULT '[]'::jsonb,
    top_genre_ids JSONB DEFAULT '[]'::jsonb,
    avg_session_length_sec INT DEFAULT 0,
    skip_rate FLOAT DEFAULT 0.0,
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RECOMMENDATION CACHE
-- Updated to store multiple dynamic sections instead of just one list
CREATE TABLE IF NOT EXISTS public.user_home_layout_cache (
    user_id BIGINT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    layout_data JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 5. SEARCH LEARNING
CREATE TABLE IF NOT EXISTS public.user_search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    frequency INT DEFAULT 1,
    last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, query)
);
