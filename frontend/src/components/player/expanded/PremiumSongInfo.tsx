import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { PlayerSong } from '../../../services/PlayerService';
import { SongStats } from '../../../services/MockDataProvider';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumSongInfoProps {
  song: PlayerSong;
  stats: SongStats | null;
  isLiked: boolean;
  onToggleLike: () => void;
}

export function PremiumSongInfo({ song, stats, isLiked, onToggleLike }: PremiumSongInfoProps) {
  return (
    <div className="w-full flex flex-col mt-4 md:mt-8 px-2">
      {/* Super title */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Now Playing</span>
        {stats?.isLossless && (
          <span className="text-[10px] font-medium tracking-wider text-[#FFD700] border border-[#FFD700]/30 bg-[#FFD700]/10 px-1.5 py-0.5 rounded-sm">
            LOSSLESS
          </span>
        )}
      </div>

      {/* Main Title and Like Button */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col min-w-0">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white truncate leading-tight tracking-tight">
            {song.song_title}
          </h2>
          
          <div className="flex items-center gap-2 mt-2">
            <h3 className="text-lg md:text-2xl font-semibold text-white/80 hover:text-white transition-colors cursor-pointer truncate">
              {song.song_artist}
            </h3>
            {stats?.isVerifiedArtist && (
              <BadgeCheck className="w-5 h-5 text-blue-400 shrink-0" />
            )}
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full shrink-0 h-12 w-12 hover:bg-white/10 group mt-2"
          onClick={onToggleLike}
        >
          <Heart className={`w-8 h-8 transition-transform group-hover:scale-110 group-active:scale-95 ${isLiked ? 'fill-primary text-primary' : 'text-white'}`} />
        </Button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="flex items-center gap-4 mt-6 text-xs md:text-sm text-white/50 font-medium">
          <span>{stats.plays} plays</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span>{stats.releaseYear}</span>
          <span className="w-1 h-1 rounded-full bg-white/30" />
          <span className="hover:text-white cursor-pointer transition-colors">{stats.genre}</span>
        </div>
      )}
    </div>
  );
}
