import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, MonitorSpeaker, ListPlus, Mic2, Shuffle, Repeat, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePlayer } from '../../context/PlayerContext';
import { PlayerSong } from '../../services/PlayerService';
import { useDominantColor } from '../../hooks/useDominantColor';
import { MoreMenu } from './MoreMenu';

interface MiniPlayerProps {
  currentSong: PlayerSong;
  isMobile: boolean;
  onExpand: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
  onAddToPlaylist: () => void;
  onAddToQueue: () => void;
}

export function MiniPlayer({ 
  currentSong, 
  isMobile, 
  onExpand,
  isLiked,
  onToggleLike,
  onAddToPlaylist,
  onAddToQueue
}: MiniPlayerProps) {
  const { isPlaying, togglePlay, progress, duration, seekTo, volume, setVolume, nextTrack, prevTrack, isReady } = usePlayer();
  const { color: dominantColor } = useDominantColor(currentSong?.song_image, 'hsl(var(--primary))');

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed md:relative bottom-[72px] md:bottom-0 left-0 right-0 z-30 h-16 md:h-24 bg-zinc-900/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-2 md:px-6 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)] w-full cursor-pointer hover:bg-zinc-800/95 transition-colors"
        onClick={onExpand}
      >
        {/* Subtle top progress bar indicating play state */}
        <div 
          className="absolute top-0 left-0 h-[2px] transition-all duration-300 ease-linear shadow-[0_0_10px_var(--player-accent)]"
          style={{ width: `${(progress / (duration || 1)) * 100}%`, backgroundColor: dominantColor, '--player-accent': dominantColor } as React.CSSProperties}
        />

        {/* Left: Song Info */}
        <div className="flex items-center gap-3 md:gap-4 w-2/3 md:w-1/3">
          <motion.div layoutId="album-art" className="relative group overflow-hidden rounded-md shadow-md h-12 w-12 md:h-16 md:w-16 shrink-0 bg-black/20">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentSong.song_uri}
                src={currentSong.song_image} 
                alt={currentSong.song_title} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </AnimatePresence>
            {!isMobile && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="text-white hover:scale-110 transition-transform h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); onExpand(); }}>
                  <MonitorSpeaker className="w-4 h-4" />
                </Button>
              </div>
            )}
          </motion.div>
          <div className="overflow-hidden flex-1 flex flex-col justify-center">
            <h4 className="text-sm font-semibold truncate text-white group-hover:underline">{currentSong.song_title}</h4>
            <p className="text-xs text-muted-foreground truncate hover:underline hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); }}>
              {currentSong.song_artist}
            </p>
          </div>
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex text-muted-foreground hover:text-white h-8 w-8 shrink-0 rounded-full"
              onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-primary text-primary' : ''}`} />
            </Button>
          )}
        </div>

        {/* Center: Playback Controls (Desktop) or Right Controls (Mobile) */}
        <div className="flex items-center justify-end md:justify-center w-1/3 gap-2 md:gap-1">
          {/* Mobile Right Controls */}
          {isMobile ? (
            <div className="flex items-center gap-2 pr-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-white h-8 w-8 shrink-0 rounded-full"
                onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary text-primary' : ''}`} />
              </Button>
              <Button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                variant="ghost"
                size="icon" 
                className="rounded-full w-10 h-10 hover:bg-white/10"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
              </Button>
            </div>
          ) : (
            // Desktop Center Controls
            <div className="flex flex-col items-center justify-center w-full" onClick={(e) => e.stopPropagation()}>
              {!isReady ? (
                <div className="text-muted-foreground text-xs animate-pulse py-4">Loading Audio...</div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all rounded-full"><Shuffle className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all rounded-full" onClick={prevTrack}><SkipBack className="w-5 h-5 fill-current" /></Button>
                    <Button onClick={togglePlay} size="icon" className="rounded-full w-10 h-10 shadow-lg hover:scale-110 active:scale-95 transition-all bg-white text-black">
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all rounded-full" onClick={nextTrack}><SkipForward className="w-5 h-5 fill-current" /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all rounded-full"><Repeat className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex items-center w-full max-w-md gap-3 mt-1">
                    <span className="text-[11px] font-medium text-muted-foreground w-10 text-right">{formatTime(progress)}</span>
                    <Slider value={[progress]} max={duration || 100} step={1} onValueChange={(val) => seekTo(val[0])} className="cursor-pointer" />
                    <span className="text-[11px] font-medium text-muted-foreground w-10">{formatTime(duration)}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Volume & Extras (Desktop only) */}
        {!isMobile && (
          <div className="flex justify-end items-center w-1/3 gap-3 pr-2 hidden md:flex" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full" onClick={() => onExpand()} title="Lyrics">
              <Mic2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full" onClick={() => onExpand()} title="Queue">
              <ListPlus className="w-4 h-4" />
            </Button>
            <MoreMenu 
              song={currentSong} 
              isLiked={isLiked} 
              onLike={onToggleLike} 
              onAddToPlaylist={onAddToPlaylist} 
              onAddToQueue={onAddToQueue} 
            />
            <div className="flex items-center gap-2 ml-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <div className="w-24">
                <Slider value={[volume * 100]} max={100} step={1} onValueChange={(val) => setVolume(val[0] / 100)} />
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
