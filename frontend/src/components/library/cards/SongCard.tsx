import React from 'react';
import { Play, Heart, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SongCardProps {
  song: any;
  onPlay: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, onPlay }) => {
  return (
    <div onClick={onPlay} className="group flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.08] transition-all cursor-pointer border border-transparent hover:border-white/[0.08] relative overflow-hidden">
      
      {/* Active Indicator or Equalizer could go here */}
      
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md shrink-0">
          <img src={song.song_image || song.image} alt={song.song_title || song.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]" onClick={(e) => { e.stopPropagation(); onPlay(); }}>
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-[15px] font-bold text-white truncate mb-0.5">{song.song_title || song.title}</h3>
          <p className="text-[13px] text-white/50 truncate flex items-center gap-2">
            {song.song_artist || song.artist}
            {song.quality && <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] uppercase tracking-wider font-bold text-white/70">{song.quality}</span>}
          </p>
        </div>
      </div>
      
      {/* Metadata Columns (Hidden on small screens) */}
      <div className="hidden md:flex items-center gap-8 px-8 flex-1 min-w-0 text-[13px] text-white/40 font-medium">
        <div className="flex-1 truncate">{song.album || 'Single'}</div>
        <div className="w-24 text-right">{song.added || 'Just now'}</div>
        <div className="w-16 text-right font-mono text-white/30">{song.duration || '3:45'}</div>
      </div>

      {/* Hover Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
        <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full text-white/50 hover:text-white hover:bg-white/10">
          <Heart className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full text-white/50 hover:text-white hover:bg-white/10">
          <Plus className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full text-white/50 hover:text-white hover:bg-white/10">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
