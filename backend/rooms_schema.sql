-- Users
CREATE TABLE public."Users" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    google_id VARCHAR(255) UNIQUE,
    provider VARCHAR(50) DEFAULT 'local',
    display_name VARCHAR(255),
    avatar TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Songs
CREATE TABLE public."Songs" (
    id SERIAL PRIMARY KEY,
    youtube_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    thumbnail TEXT,
    duration INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Rooms
CREATE TABLE public."Rooms" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_type VARCHAR(50) DEFAULT 'AUTO', -- AUTO, CUSTOM, CURRENT_SONG
    custom_cover_image TEXT,
    genre VARCHAR(100),
    host_id INTEGER REFERENCES public."Users"(id),
    visibility VARCHAR(50) DEFAULT 'public',
    status VARCHAR(50) DEFAULT 'active', -- active, paused, ended
    max_members INTEGER DEFAULT 100,
    voice_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
CREATE INDEX idx_rooms_name ON public."Rooms"(name);
CREATE INDEX idx_rooms_genre ON public."Rooms"(genre);
CREATE INDEX idx_rooms_host ON public."Rooms"(host_id);
CREATE INDEX idx_rooms_status ON public."Rooms"(status);

-- RoomSettings
CREATE TABLE public."RoomSettings" (
    room_id INTEGER PRIMARY KEY REFERENCES public."Rooms"(id) ON DELETE CASCADE,
    allow_queue BOOLEAN DEFAULT true,
    allow_chat BOOLEAN DEFAULT true,
    allow_voice BOOLEAN DEFAULT true,
    allow_votes BOOLEAN DEFAULT true,
    allow_guests BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- PlaybackState
CREATE TABLE public."PlaybackState" (
    room_id INTEGER PRIMARY KEY REFERENCES public."Rooms"(id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES public."Songs"(id),
    is_playing BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0, -- in seconds
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RoomMembers
CREATE TABLE public."RoomMembers" (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES public."Rooms"(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES public."Users"(id),
    role VARCHAR(50) DEFAULT 'listener', -- host, moderator, listener
    is_muted BOOLEAN DEFAULT true,
    is_speaking BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(room_id, user_id)
);

-- Messages
CREATE TABLE public."Messages" (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES public."Rooms"(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES public."Users"(id),
    type VARCHAR(50) DEFAULT 'text', -- text, emoji, system, song, join, leave
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted BOOLEAN DEFAULT false
);

-- Queue
CREATE TABLE public."Queue" (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES public."Rooms"(id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES public."Songs"(id),
    added_by INTEGER REFERENCES public."Users"(id),
    position INTEGER DEFAULT 0,
    played BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- QueueVotes
CREATE TABLE public."QueueVotes" (
    queue_id INTEGER REFERENCES public."Queue"(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES public."Users"(id),
    vote INTEGER NOT NULL, -- +1 or -1
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(queue_id, user_id)
);

-- RoomActivity
CREATE TABLE public."RoomActivity" (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES public."Rooms"(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- joined, left, song_changed, queue_added, vote, voice_started, voice_ended
    user_id INTEGER REFERENCES public."Users"(id),
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RoomHistory
CREATE TABLE public."RoomHistory" (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES public."Rooms"(id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES public."Songs"(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- RoomInvites
CREATE TABLE public."RoomInvites" (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES public."Rooms"(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES public."Users"(id),
    receiver_id INTEGER REFERENCES public."Users"(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Notifications
CREATE TABLE public."Notifications" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public."Users"(id),
    type VARCHAR(50) NOT NULL,
    payload JSONB,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public."Rooms";
ALTER PUBLICATION supabase_realtime ADD TABLE public."RoomMembers";
ALTER PUBLICATION supabase_realtime ADD TABLE public."Messages";
ALTER PUBLICATION supabase_realtime ADD TABLE public."Queue";
ALTER PUBLICATION supabase_realtime ADD TABLE public."QueueVotes";
ALTER PUBLICATION supabase_realtime ADD TABLE public."RoomActivity";
ALTER PUBLICATION supabase_realtime ADD TABLE public."PlaybackState";
