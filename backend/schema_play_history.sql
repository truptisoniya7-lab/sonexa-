-- Drop old history table if needed (optional, but requested by plan to avoid confusion)
DROP TABLE IF EXISTS public.user_listening_history CASCADE;
DROP TABLE IF EXISTS public.listening_history CASCADE;

-- 1. TRACKS CATALOG ENRICHMENT
-- Make sure tracks table exists (schema_updates_v2 might have it, but just in case)
CREATE TABLE IF NOT EXISTS public.tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_video_id TEXT UNIQUE NOT NULL,
    spotify_id TEXT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    duration_ms INTEGER,
    thumbnail TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PLAY HISTORY
CREATE TABLE IF NOT EXISTS public.play_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    song_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE,
    progress FLOAT DEFAULT 0.0, -- Percentage 0.0 to 1.0
    last_position INT DEFAULT 0, -- In seconds
    completed BOOLEAN DEFAULT false,
    play_count INT DEFAULT 1,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    room_id UUID, -- For future Live Rooms integration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_play_history_user ON public.play_history (user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_play_history_song ON public.play_history (song_id);

-- 3. SEARCH HISTORY
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    clicked_song_id UUID REFERENCES public.tracks(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history (user_id, timestamp DESC);
