-- Sonexa Redesign & Architecture Plan (Final Version)
-- Run this in your Supabase SQL Editor

-- 1. Recommendation Cache
CREATE TABLE IF NOT EXISTS recommendation_cache (
    user_id TEXT PRIMARY KEY,
    recommendations JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 2. Playback Sessions (for Continue Listening)
CREATE TABLE IF NOT EXISTS playback_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    track_id TEXT NOT NULL,
    progress_ms INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_playback_user_updated ON playback_sessions(user_id, updated_at DESC);

-- 3. Playback Queue (for cross-device queue persistence)
CREATE TABLE IF NOT EXISTS playback_queue (
    user_id TEXT PRIMARY KEY,
    track_ids JSONB DEFAULT '[]'::jsonb,
    current_index INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Friend Activity
CREATE TABLE IF NOT EXISTS friend_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    track_id TEXT,
    type TEXT NOT NULL, -- e.g. 'liked', 'listening', 'joined_room'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_friend_activity_user ON friend_activity(user_id, created_at DESC);

-- 5. Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'play', 'pause', 'skip', 'like', 'search', 'join_room'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tracks (Cache mapping)
CREATE TABLE IF NOT EXISTS tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    youtube_video_id TEXT UNIQUE NOT NULL,
    spotify_id TEXT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    duration_ms INTEGER,
    thumbnail TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tracks_title ON tracks(title);
