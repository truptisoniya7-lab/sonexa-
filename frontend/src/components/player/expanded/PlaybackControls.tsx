import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, MonitorSpeaker, Mic2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';

interface PlaybackControlsProps {
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (val: number) => void;
  setVolume: (val: number) => void;
  formatTime: (secs: number) => string;
}

export function PlaybackControls({
  isPlaying, progress, duration, volume, togglePlay, nextTrack, prevTrack, seekTo, setVolume, formatTime
}: PlaybackControlsProps) {
  
  return (
    <div className="w-full flex flex-col mt-8 px-2">
      {/* Progress Bar */}
      <div className="w-full mb-6 group">
        <Slider 
          value={[progress]} 
          max={duration || 100} 
          step={1}
          onValueChange={(val) => seekTo(val[0])}
          className="w-full mb-3 cursor-pointer py-2 [&_[role=slider]]:opacity-0 group-hover:[&_[role=slider]]:opacity-100 transition-opacity"
        />
        <div className="flex justify-between text-xs text-white/50 font-medium">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Primary Controls */}
      <div className="w-full flex justify-between items-center mb-8">
        <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
          <Shuffle className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-4 md:gap-8">
          <Button variant="ghost" size="icon" onClick={prevTrack} className="text-white hover:bg-white/10 rounded-full h-12 w-12 transition-colors">
            <SkipBack className="w-8 h-8 fill-current" />
          </Button>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={togglePlay} 
              className="rounded-full h-16 w-16 md:h-20 md:w-20 bg-white text-black hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </Button>
          </motion.div>
          
          <Button variant="ghost" size="icon" onClick={nextTrack} className="text-white hover:bg-white/10 rounded-full h-12 w-12 transition-colors">
            <SkipForward className="w-8 h-8 fill-current" />
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
          <Repeat className="w-5 h-5" />
        </Button>
      </div>

      {/* Secondary Controls */}
      <div className="w-full flex items-center justify-between mt-2 pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 w-[150px] group">
          <Volume2 className="w-5 h-5 text-white/50 group-hover:text-white transition-colors shrink-0" />
          <Slider 
            value={[volume * 100]} 
            max={100} 
            step={1} 
            onValueChange={(val) => setVolume(val[0] / 100)} 
            className="w-full opacity-50 group-hover:opacity-100 transition-opacity"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white/50 hover:text-white rounded-full">
            <MonitorSpeaker className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white/50 hover:text-white rounded-full">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
