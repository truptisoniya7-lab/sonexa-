import React from 'react';
import { PlayerSong } from '../../../services/PlayerService';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface UpNextCardProps {
  song: PlayerSong;
  onPlay: () => void;
}

export function UpNextCard({ song, onPlay }: UpNextCardProps) {
  return (
    <div className="w-full flex flex-col mb-6">
      <div className="flex items-center gap-4 mb-4 px-2">
        <h4 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] bg-primary/10 px-2 py-1 rounded">
          ▶ Up Next
        </h4>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      
      <motion.div 
        className="w-full relative group cursor-pointer rounded-2xl overflow-hidden bg-white/5 border border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.15)] p-4 flex gap-5 items-center hover:bg-white/10 transition-colors"
        onClick={onPlay}
        whileHover={{ y: -3, scale: 1.01 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-lg shrink-0 border border-white/10">
          <img src={song.song_image} alt={song.song_title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <Play className="w-10 h-10 fill-current text-white" />
          </div>
        </div>
        
        <div className="flex flex-col flex-1 min-w-0 justify-center">
          <h3 className="text-xl font-bold text-white truncate leading-tight mb-1.5 group-hover:text-primary transition-colors">{song.song_title}</h3>
          <p className="text-sm text-white/70 truncate">{song.song_artist}</p>
        </div>
        
        <div className="text-sm font-semibold text-white/40 shrink-0 px-2">
          {/* Mock duration */}
          2:54
        </div>
      </motion.div>
    </div>
  );
}
