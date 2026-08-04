import React from 'react';
import { PlayerSong } from '../../../services/PlayerService';
import { Play, Heart, MoreHorizontal, ListPlus } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface RecommendationCardProps {
  song: PlayerSong;
  index: number;
  onPlay: () => void;
  isDraggable?: boolean;
}

export function RecommendationCard({ song, index, onPlay, isDraggable = false }: RecommendationCardProps) {
  const content = (
    <div 
      className="group flex flex-col p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
    >
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-black/20" onClick={onPlay}>
          <img src={song.song_image} alt={song.song_title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
            <Play className="w-6 h-6 fill-current text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center" onClick={onPlay}>
          <h4 className="text-[15px] font-bold text-white truncate group-hover:text-primary transition-colors">
            {song.song_title}
          </h4>
          <p className="text-[13px] text-white/70 truncate mt-0.5">{song.song_artist}</p>
        </div>
        
        <div className="text-xs font-semibold text-white/30 shrink-0 px-2 transition-opacity group-hover:hidden">
          3:12
        </div>

        {song.matchScore && (
          <div className="hidden lg:flex flex-col items-end justify-center pr-2 shrink-0 group-hover:hidden">
            <span className="text-[11px] font-bold text-primary">
              {song.matchScore}% Match
            </span>
            <span className="text-[10px] text-white/50 truncate max-w-[100px]">
              {song.recommendationReason}
            </span>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-200 bg-black/40 backdrop-blur-sm rounded-full pl-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white/70 hover:text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); onPlay(); }}>
            <Play className="w-4 h-4 fill-current" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white/70 hover:text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); }}>
            <ListPlus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white/70 hover:text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); }}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (isDraggable) {
    return (
      <Reorder.Item 
        value={song} 
        id={song.song_uri}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {content}
      </Reorder.Item>
    );
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }} 
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {content}
    </motion.div>
  );
}
