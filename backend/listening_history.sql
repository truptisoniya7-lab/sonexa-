-- Supabase SQL to create the listening history table

CREATE TABLE IF NOT EXISTS public.listening_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL,
    song_title TEXT NOT NULL,
    song_artist TEXT NOT NULL,
    song_image TEXT NOT NULL,
    song_duration INTEGER DEFAULT 0,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by user and ordered by time
CREATE INDEX IF NOT EXISTS listening_history_user_id_idx ON public.listening_history (user_id, played_at DESC);
