'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, MonitorSpeaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalPlayer() {
  const { currentSong, isPlaying, togglePlay, progress, duration, seekTo } = usePlayer();
  const router = useRouter();

  if (!currentSong) return null;

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
        className="h-24 bg-background/80 backdrop-blur-xl border-t border-border/50 flex items-center justify-between px-4 md:px-6 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] relative"
      >
        {/* Subtle top progress bar indicating play state */}
        <div 
          className="absolute top-0 left-0 h-[2px] bg-primary transition-all duration-300 ease-linear"
          style={{ width: `${(progress / (duration || 1)) * 100}%` }}
        />

        {/* Left: Song Info */}
        <div 
          onClick={() => {
            if (currentSong.room_id) {
              router.push(`/room/${currentSong.room_id}`);
            }
          }}
          className={`flex items-center gap-4 w-1/3 ${currentSong.room_id ? 'cursor-pointer hover:bg-accent/50 rounded-lg p-1 transition-colors -ml-1' : ''}`}
        >
          <div className="relative group overflow-hidden rounded-md shadow-md h-14 w-14">
            <img 
              src={currentSong.song_image} 
              alt={currentSong.song_title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            {currentSong.room_id && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <MonitorSpeaker className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-sm font-semibold truncate hover:underline">{currentSong.song_title}</h4>
            <p className="text-xs text-muted-foreground truncate hover:underline">{currentSong.song_artist}</p>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex flex-col items-center justify-center w-1/3 gap-1">
          <div className="flex items-center gap-4 md:gap-6">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <SkipBack className="w-5 h-5 fill-current" />
            </Button>
            
            <Button 
              onClick={togglePlay}
              size="icon" 
              className="rounded-full w-10 h-10 shadow-lg hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-1" />
              )}
            </Button>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <SkipForward className="w-5 h-5 fill-current" />
            </Button>
          </div>
          
          <div className="flex items-center w-full max-w-md gap-3 mt-1">
            <span className="text-[11px] font-medium text-muted-foreground w-10 text-right">
              {formatTime(progress)}
            </span>
            <Slider 
              value={[progress]} 
              max={duration || 100} 
              step={1}
              onValueChange={(val) => seekTo(val[0])}
              className="cursor-pointer"
            />
            <span className="text-[11px] font-medium text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume */}
        <div className="flex justify-end items-center w-1/3 gap-3 pr-2">
          <Volume2 className="w-5 h-5 text-muted-foreground" />
          <div className="w-24">
            <Slider defaultValue={[100]} max={100} step={1} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
