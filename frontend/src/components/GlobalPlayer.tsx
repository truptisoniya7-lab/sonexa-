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
      <MiniPlayer 
        currentSong={currentSong as PlayerSong}
        isMobile={isMobile}
        onExpand={() => setIsExpanded(true)}
        isLiked={isLiked}
        onToggleLike={handleToggleLike}
        onAddToPlaylist={handleAddToPlaylist}
        onAddToQueue={handleAddToQueue}
        session={session}
        leaveRoom={leaveRoom}
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
