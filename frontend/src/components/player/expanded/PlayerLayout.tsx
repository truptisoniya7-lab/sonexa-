import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, ListMusic, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '../../../context/PlayerContext';
import { PlayerSong } from '../../../services/PlayerService';
import { MockDataProvider, SongStats } from '../../../services/MockDataProvider';
import { MoreMenu } from '../MoreMenu';

import { BackgroundEffects } from './BackgroundEffects';
import { AlbumArtwork } from './AlbumArtwork';
import { PremiumSongInfo } from './PremiumSongInfo';
import { PlaybackControls } from './PlaybackControls';
import { DiscoveryPanel } from './DiscoveryPanel';
import { PremiumQueuePanel } from './QueuePanel';
import { LyricsPanel } from '../LyricsPanel';

interface PlayerLayoutProps {
  currentSong: PlayerSong;
  isMobile: boolean;
  onClose: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
  onAddToPlaylist: () => void;
  onAddToQueue: () => void;
}

export function PlayerLayout({
  currentSong, isMobile, onClose, isLiked, onToggleLike, onAddToPlaylist, onAddToQueue
}: PlayerLayoutProps) {
  const { isPlaying, togglePlay, progress, duration, seekTo, volume, setVolume, nextTrack, prevTrack, queue, playSong, updateQueue } = usePlayer();
  
  const [activeTab, setActiveTab] = useState<'queue' | 'lyrics' | 'credits'>('queue');
  const [stats, setStats] = useState<SongStats | null>(null);

  useEffect(() => {
    MockDataProvider.getSongStats(currentSong.song_uri).then(setStats);
  }, [currentSong.song_uri]);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    if (offset.y > 100 || velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        drag={isMobile ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={isMobile ? handleDragEnd : undefined}
        className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col overflow-y-auto overflow-x-hidden md:overflow-hidden"
      >
        <BackgroundEffects imageUrl={currentSong.song_image} />
        
        {/* Top Header */}
        <div className="relative z-10 flex justify-between items-center px-6 py-6 md:px-10 md:py-8 shrink-0">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronDown className="w-8 h-8" />
          </Button>
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Playing from {activeTab === 'queue' ? 'Smart Queue' : 'Library'}</span>
          </div>
          <MoreMenu 
            song={currentSong} 
            isLiked={isLiked} 
            onLike={onToggleLike} 
            onAddToPlaylist={onAddToPlaylist} 
            onAddToQueue={onAddToQueue} 
          />
        </div>

        {/* 2-Column Desktop Grid / Vertical Mobile Layout */}
        <div className="relative z-10 flex-1 w-full max-w-[1700px] mx-auto flex flex-col md:flex-row md:overflow-hidden pb-8 px-6 md:px-10 gap-10 lg:gap-16">
          
          {/* LEFT COLUMN (65%) */}
          <div className="w-full md:w-[60%] lg:w-[65%] flex flex-col md:overflow-y-auto custom-scrollbar md:pr-6 h-full">
            
            <AlbumArtwork 
              imageUrl={currentSong.song_image} 
              title={currentSong.song_title} 
              isPlaying={isPlaying} 
            />
            
            <div className="w-full max-w-3xl mx-auto">
              <PremiumSongInfo 
                song={currentSong} 
                stats={stats} 
                isLiked={isLiked} 
                onToggleLike={onToggleLike} 
              />
              
              <PlaybackControls 
                isPlaying={isPlaying}
                progress={progress}
                duration={duration}
                volume={volume}
                togglePlay={togglePlay}
                nextTrack={nextTrack}
                prevTrack={prevTrack}
                seekTo={seekTo}
                setVolume={setVolume}
                formatTime={formatTime}
              />
            </div>

            <div className="w-full max-w-4xl mx-auto">
              <DiscoveryPanel />
            </div>

          </div>

          {/* RIGHT COLUMN (35%) */}
          {!isMobile && (
            <div className="w-full md:w-[40%] lg:w-[35%] h-full flex flex-col shrink-0 bg-black/20 rounded-3xl border border-white/5 backdrop-blur-md overflow-hidden">
              
              {/* Tabs */}
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5 shrink-0">
                <div className="flex gap-2">
                  <Button 
                    variant={activeTab === 'queue' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className={`rounded-full px-4 h-9 ${activeTab === 'queue' ? 'bg-white text-black hover:bg-gray-200' : 'text-white/70 hover:text-white hover:bg-white/10'}`} 
                    onClick={() => setActiveTab('queue')}
                  >
                    <ListMusic className="w-4 h-4 mr-2" /> Queue
                  </Button>
                  <Button 
                    variant={activeTab === 'lyrics' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className={`rounded-full px-4 h-9 ${activeTab === 'lyrics' ? 'bg-white text-black hover:bg-gray-200' : 'text-white/70 hover:text-white hover:bg-white/10'}`} 
                    onClick={() => setActiveTab('lyrics')}
                  >
                    <FileText className="w-4 h-4 mr-2" /> Lyrics
                  </Button>
                  <Button 
                    variant={activeTab === 'credits' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className={`rounded-full px-4 h-9 ${activeTab === 'credits' ? 'bg-white text-black hover:bg-gray-200' : 'text-white/70 hover:text-white hover:bg-white/10'}`} 
                    onClick={() => setActiveTab('credits')}
                  >
                    <Users className="w-4 h-4 mr-2" /> Credits
                  </Button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden p-6">
                {activeTab === 'queue' && (
                  <PremiumQueuePanel 
                    queue={queue} 
                    currentSongIndex={queue.findIndex(s => s.song_uri === currentSong.song_uri)} 
                    onPlaySong={(idx) => {
                      const s = queue[idx];
                      if (s) playSong(s, false);
                    }}
                    onReorder={updateQueue}
                  />
                )}
                {activeTab === 'lyrics' && (
                  <div className="h-full overflow-y-auto custom-scrollbar pr-4">
                    <LyricsPanel song={currentSong} />
                  </div>
                )}
                {activeTab === 'credits' && (
                  <div className="h-full flex items-center justify-center text-white/50 text-sm">
                    Credits not available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation for Panels */}
        {isMobile && (
          <div className="relative z-10 w-full flex flex-col bg-black/80 backdrop-blur-xl border-t border-white/10 mt-auto shrink-0">
            {/* Mobile Tab Content (if queue/lyrics/credits is active on mobile) */}
            <div className="h-[40vh] w-full overflow-hidden">
              {activeTab === 'queue' && (
                <div className="h-full p-4">
                  <PremiumQueuePanel 
                    queue={queue} 
                    currentSongIndex={queue.findIndex(s => s.song_uri === currentSong.song_uri)} 
                    onPlaySong={(idx) => {
                      const s = queue[idx];
                      if (s) playSong(s, false);
                    }}
                    onReorder={updateQueue}
                  />
                </div>
              )}
              {activeTab === 'lyrics' && (
                <div className="h-full p-4 overflow-y-auto custom-scrollbar">
                  <LyricsPanel song={currentSong} />
                </div>
              )}
            </div>

            {/* Mobile Tab Bar */}
            <div className="flex items-center justify-around py-3 px-4 pb-8 border-t border-white/5">
              <Button variant="ghost" className={`flex flex-col items-center gap-1 h-auto py-2 ${activeTab === 'queue' ? 'text-white' : 'text-white/50'}`} onClick={() => setActiveTab('queue')}>
                <ListMusic className="w-5 h-5" />
                <span className="text-[10px]">Queue</span>
              </Button>
              <Button variant="ghost" className={`flex flex-col items-center gap-1 h-auto py-2 ${activeTab === 'lyrics' ? 'text-white' : 'text-white/50'}`} onClick={() => setActiveTab('lyrics')}>
                <FileText className="w-5 h-5" />
                <span className="text-[10px]">Lyrics</span>
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
