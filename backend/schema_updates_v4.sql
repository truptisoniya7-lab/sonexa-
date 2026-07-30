-- ==========================================
-- SONEXA SCHEMA V4 (Playlists & History)
-- ==========================================

-- 1. LISTENING HISTORY
CREATE TABLE IF NOT EXISTS public.listening_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE, -- Assuming users.id is BIGINT based on schema_updates_v2
    song_id TEXT NOT NULL,
    song_title TEXT NOT NULL,
    song_artist TEXT NOT NULL,
    song_image TEXT NOT NULL,
    song_duration INTEGER DEFAULT 0,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listening_history_user_id_idx ON public.listening_history (user_id, played_at DESC);

-- 2. PLAYLISTS
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    is_public BOOLEAN DEFAULT true,
    listeners INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PLAYLIST SONGS (Mapping Table)
CREATE TABLE IF NOT EXISTS public.playlist_songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
    song_id TEXT NOT NULL,
    song_title TEXT NOT NULL,
    song_artist TEXT NOT NULL,
    song_image TEXT NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.playlists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.listening_history;

-- SEED SOME TRENDING PLAYLISTS
INSERT INTO public.playlists (user_id, name, description, cover_image, is_public, listeners)
VALUES 
(1, 'Late Night Lofi', 'Beats to chill and study to.', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&q=80', true, 15420),
(1, 'Bollywood Party 2026', 'The biggest dance tracks.', 'https://images.unsplash.com/photo-1621360811013-c76831f162cb?w=500&q=80', true, 42100),
(1, 'Acoustic Morning', 'Wake up gently.', 'https://images.unsplash.com/photo-1460036521480-c4c50813f3ba?w=500&q=80', true, 8900),
(1, 'Workout Hype', 'Maximum energy for the gym.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80', true, 21050)
ON CONFLICT DO NOTHING;
