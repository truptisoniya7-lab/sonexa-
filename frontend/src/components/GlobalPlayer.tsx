'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, MonitorSpeaker, ListPlus, Mic2, Shuffle, Repeat, ChevronDown, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function GlobalPlayer() {
  const { currentSong, isPlaying, togglePlay, progress, duration, seekTo, volume, setVolume, nextTrack, prevTrack, isReady } = usePlayer();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentSong) return null;

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    if (offset.y > 100 || velocity.y > 500) {
      setIsExpanded(false);
    }
  };

  // Full Screen Mobile Player Overlay
  if (isMobile && isExpanded) {
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl flex flex-col pt-12 pb-8 px-6"
        >
          {/* Background Blur Image */}
          <div 
            className="absolute inset-0 opacity-20 blur-3xl saturate-200 pointer-events-none"
            style={{ backgroundImage: `url(${currentSong.song_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          
          <div className="relative z-10 flex justify-between items-center mb-8">
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="rounded-full">
              <ChevronDown className="w-8 h-8" />
            </Button>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Now Playing</span>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ListPlus className="w-5 h-5" />
            </Button>
          </div>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
            <motion.div 
              layoutId="album-art"
              className="w-full aspect-square max-w-[320px] rounded-2xl overflow-hidden shadow-2xl mb-8"
            >
              <img src={currentSong.song_image} alt={currentSong.song_title} className="w-full h-full object-cover" />
            </motion.div>

            <div className="w-full flex justify-between items-end mb-6">
              <div className="flex flex-col overflow-hidden">
                <h2 className="text-2xl font-bold truncate text-white">{currentSong.song_title}</h2>
                <p className="text-lg text-muted-foreground truncate">{currentSong.song_artist}</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                <Heart className="w-6 h-6" />
              </Button>
            </div>

            <div className="w-full mb-6">
              <Slider 
                value={[progress]} 
                max={duration || 100} 
                step={1}
                onValueChange={(val) => seekTo(val[0])}
                className="w-full mb-2 cursor-pointer py-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="w-full flex justify-between items-center px-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <Shuffle className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={prevTrack} className="text-white hover:bg-white/10 rounded-full h-14 w-14">
                <SkipBack className="w-8 h-8 fill-current" />
              </Button>
              <Button onClick={togglePlay} className="rounded-full h-20 w-20 bg-white text-black hover:bg-gray-200 hover:scale-105 transition-transform shadow-lg">
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={nextTrack} className="text-white hover:bg-white/10 rounded-full h-14 w-14">
                <SkipForward className="w-8 h-8 fill-current" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <Repeat className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Mini Player (Mobile) or Desktop Full Player
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed md:relative bottom-[72px] md:bottom-0 left-0 right-0 z-30 h-16 md:h-24 bg-background/95 backdrop-blur-xl border-t border-border/50 flex items-center justify-between px-2 md:px-6 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.5)] w-full"
        onClick={() => { if (isMobile) setIsExpanded(true); }}
      >
        {/* Subtle top progress bar indicating play state */}
        <div 
          className="absolute top-0 left-0 h-[2px] bg-primary transition-all duration-300 ease-linear"
          style={{ width: `${(progress / (duration || 1)) * 100}%` }}
        />

        {/* Left: Song Info */}
        <div className="flex items-center gap-3 md:gap-4 w-2/3 md:w-1/3">
          <motion.div layoutId={isMobile ? "album-art" : undefined} className="relative group overflow-hidden rounded-md shadow-md h-12 w-12 md:h-14 md:w-14 shrink-0">
            <img 
              src={currentSong.song_image} 
              alt={currentSong.song_title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
          </motion.div>
          <div className="overflow-hidden flex-1 flex flex-col justify-center">
            <h4 className="text-sm font-semibold truncate text-white">{currentSong.song_title}</h4>
            <p className="text-xs text-muted-foreground truncate">{currentSong.song_artist}</p>
          </div>
        </div>

        {/* Center: Playback Controls (Desktop) or Right Controls (Mobile) */}
        <div className="flex items-center justify-end md:justify-center w-1/3 gap-2 md:gap-1">
          {/* Mobile Right Controls */}
          {isMobile ? (
            <div className="flex items-center gap-2 pr-2">
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
            <div className="flex flex-col items-center justify-center w-full">
              {!isReady ? (
                <div className="text-muted-foreground text-xs animate-pulse">Loading Audio...</div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><Shuffle className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={prevTrack}><SkipBack className="w-5 h-5 fill-current" /></Button>
                    <Button onClick={togglePlay} size="icon" className="rounded-full w-10 h-10 shadow-lg hover:scale-105 transition-transform">
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={nextTrack}><SkipForward className="w-5 h-5 fill-current" /></Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><Repeat className="w-4 h-4" /></Button>
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
          <div className="flex justify-end items-center w-1/3 gap-3 pr-2 hidden md:flex">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8"><Mic2 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8"><ListPlus className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8"><MonitorSpeaker className="w-4 h-4" /></Button>
            <div className="flex items-center gap-2">
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
