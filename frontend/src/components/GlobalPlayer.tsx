'use client';

import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useRoomContext } from '@/context/RoomContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MiniPlayer } from './player/MiniPlayer';
import { ExpandedPlayer } from './player/ExpandedPlayer';
import { PlaylistModal } from './player/PlaylistModal';
import { usePlayerShortcuts } from '../hooks/usePlayerShortcuts';
import { PlayerService, PlayerSong } from '../services/PlayerService';
import Link from 'next/link';
import { Users, LogOut, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

export default function GlobalPlayer() {
  const { currentSong } = usePlayer();
  const { session, leaveRoom } = useRoomContext();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Check like status when song changes
  useEffect(() => {
    if (currentSong?.song_uri) {
      PlayerService.isLiked(currentSong.song_uri).then(setIsLiked);
    }
  }, [currentSong]);

  const handleToggleLike = async () => {
    if (currentSong) {
      const newStatus = await PlayerService.toggleLike(currentSong as PlayerSong);
      setIsLiked(newStatus);
    }
  };

  const handleAddToPlaylist = () => {
    setIsPlaylistModalOpen(true);
  };

  const handleAddToQueue = () => {
    // Already in queue naturally if playing, but if they want to add it again
    if (currentSong) {
      // Not typically done to add the *current* song to the queue again, but we can call it.
      // We will just do a mock toast in a real app.
    }
  };

  // Keyboard shortcuts
  usePlayerShortcuts(
    isExpanded,
    setIsExpanded,
    handleToggleLike,
    () => setIsExpanded(true), // Queue shortcut expands player
    handleAddToPlaylist
  );

  if (!currentSong) return null;

  return (
    <>
      {session && session.connectionStatus !== 'disconnected' && !isExpanded && (
        <div className="mx-4 md:mx-auto md:max-w-3xl lg:max-w-5xl mb-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-sm font-bold text-white truncate">{session.roomName}</span>
              </div>
              <p className="text-xs text-white/60 flex items-center gap-1 mt-0.5">
                <Users className="w-3 h-3" /> {session.members?.length || 0} Members
              </p>
            </div>
            <div className="hidden sm:flex border-l border-white/10 pl-4 items-center gap-2 text-xs text-primary/80 truncate">
               🎵 {currentSong.song_title}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/room/${session.roomId}`}>
              <Button variant="secondary" size="sm" className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white">
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> Return
              </Button>
            </Link>
            <Button variant="destructive" size="sm" className="h-8 text-xs bg-red-500/20 hover:bg-red-500/40 text-red-500 hover:text-red-400" onClick={leaveRoom}>
              <LogOut className="w-3.5 h-3.5 mr-1" /> Leave
            </Button>
          </div>
        </div>
      )}

      <MiniPlayer 
        currentSong={currentSong as PlayerSong}
        isMobile={isMobile}
        onExpand={() => setIsExpanded(true)}
        isLiked={isLiked}
        onToggleLike={handleToggleLike}
        onAddToPlaylist={handleAddToPlaylist}
        onAddToQueue={handleAddToQueue}
      />

      {isExpanded && (
        <ExpandedPlayer 
          currentSong={currentSong as PlayerSong}
          isMobile={isMobile}
          onClose={() => setIsExpanded(false)}
          isLiked={isLiked}
          onToggleLike={handleToggleLike}
          onAddToPlaylist={handleAddToPlaylist}
          onAddToQueue={handleAddToQueue}
        />
      )}

      {isPlaylistModalOpen && (
        <PlaylistModal 
          open={isPlaylistModalOpen}
          onOpenChange={setIsPlaylistModalOpen}
          song={currentSong as PlayerSong}
        />
      )}
    </>
  );
}
