import React, { Fragment } from 'react';
import { motion } from 'framer-motion';
import { Play, Music, User, ChevronUp, ArrowUp, X, Clock, Flame, Activity, History, MoreVertical, ThumbsUp, ThumbsDown, Trash2, GripVertical, BarChart2, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface QueuePanelProps {
  queue: any[];
  currentSongIndex: number;
  recommendedSongs: any[];
  onPlaySong: (song: any) => void;
  onPlayExisting: (song: any) => void;
  onSetCurrentIndex: (index: number) => void;
  onVote: (id: number, dir: 'up'|'down') => void;
  onRemove: (id: number) => void;
  onAdd: (song: any) => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({ queue, currentSongIndex, recommendedSongs, onPlaySong, onPlayExisting, onSetCurrentIndex, onVote, onRemove, onAdd }) => {

  const renderSongCard = (song: any, index: number, isPlaying: boolean, isTrending: boolean = false) => {
    const displayIndex = index >= 0 ? index + 1 : null;
    
    return (
      <Fragment key={song.id || `${song.song_uri}-${index}`}>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -10 }}
          key={`${isTrending ? 'trend' : 'q'}-${song.song_uri}-${index}`}
          className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-300 relative border border-white/5 ${isPlaying ? 'bg-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'bg-black/20 hover:bg-white/10 hover:-translate-y-1 hover:rotate-[1deg] hover:shadow-xl backdrop-blur-md'}`}
          onClick={() => {
            if (isTrending) {
              onPlaySong(song);
            } else if (index >= 0) {
              onPlayExisting(song);
              onSetCurrentIndex(index);
            }
          }}
        >
          {isPlaying && (
            <div className="absolute inset-0 bg-primary/5 rounded-xl animate-pulse pointer-events-none border border-primary/20"></div>
          )}
          
          <div className="w-4 text-center shrink-0">
            {isPlaying ? (
              <BarChart2 className="w-4 h-4 text-primary animate-pulse" />
            ) : (
              <span className="text-xs font-bold text-muted-foreground group-hover:text-white transition-colors">{displayIndex}</span>
            )}
          </div>

          {/* Thumbnail */}
          <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 bg-black/50 border border-white/5">
            {song.song_image ? (
              <img src={song.song_image} alt="Art" className="w-full h-full object-cover" />
            ) : (
              <Music className="w-full h-full p-2 text-muted-foreground/50" />
            )}
          </div>

          {/* Title & Artist */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h4 className={`text-sm font-medium truncate leading-tight \${isPlaying ? 'text-primary' : 'text-foreground group-hover:text-white transition-colors'}`}>
              {song.song_title}
            </h4>
            <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
              {song.song_artist}
            </p>
          </div>

          {/* Added By & Votes */}
          {!isTrending && (
            <div className="hidden sm:flex items-center gap-4 shrink-0 text-muted-foreground mr-2">
               <div className="flex items-center gap-1.5" title={`Added by \${song.added_by || 'User'}`}>
                 <Avatar className="w-5 h-5 border border-white/10 opacity-70 group-hover:opacity-100 transition-opacity">
                   <AvatarImage src={`https://i.pravatar.cc/150?u=\${song.added_by || song.id}`} />
                   <AvatarFallback><User className="w-3 h-3" /></AvatarFallback>
                 </Avatar>
               </div>
               
               <button 
                 className="flex items-center gap-1 text-[11px] font-semibold hover:text-green-400 transition-colors w-8 justify-end" 
                 onClick={(e) => { e.stopPropagation(); onVote(song.id, 'up'); }}
               >
                 {song.votes || 0} <ChevronUp className="w-3 h-3" />
               </button>
            </div>
          )}

          {/* Duration & Actions */}
          <div className="flex items-center gap-3 shrink-0">
             <span className="text-[11px] text-muted-foreground font-medium w-8 text-right">
               {song.duration || '3:45'}
             </span>
             
             {/* Hover Actions */}
             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity w-14 justify-end">
                {!isPlaying && !isTrending && (
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }} className="w-6 h-6 text-muted-foreground hover:text-primary rounded-full hover:bg-white/10">
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                )}
                {!isTrending && (
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onRemove(song.id); }} className="w-6 h-6 text-muted-foreground hover:text-destructive rounded-full hover:bg-white/10">
                    <X className="w-3 h-3" />
                  </Button>
                )}
                {isTrending && (
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onAdd(song); }} className="w-6 h-6 text-muted-foreground hover:text-primary rounded-full hover:bg-white/10" title="Add to Queue">
                    <Play className="w-3 h-3" />
                  </Button>
                )}
             </div>
          </div>
        </motion.div>
      </Fragment>
    );
  };

  const currentSong = queue[currentSongIndex];

  return (
    <>
      {queue.length === 0 && (
        <div className="flex flex-col items-center justify-center text-muted-foreground text-sm opacity-70 my-8">
          <Music className="w-10 h-10 mb-3 opacity-50" />
          <p className="font-medium">The queue is empty.</p>
        </div>
      )}
      
      {/* NOW PLAYING */}
      {currentSong && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase flex items-center gap-2 px-1 mb-1">
            <Activity className="w-3.5 h-3.5" /> Now Playing
          </h3>
          {renderSongCard(currentSong, currentSongIndex, true)}
        </div>
      )}

      {/* NEXT UP */}
      {queue.length > currentSongIndex + 1 && (
        <div className="space-y-2">
          <div className="flex items-center gap-4 px-1 mb-1">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase flex items-center gap-2 shrink-0">
              <Clock className="w-3.5 h-3.5" /> Up Next
            </h3>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>
          <div className="space-y-0.5">
            {queue.slice(currentSongIndex + 1).map((song, index) => (
              renderSongCard(song, currentSongIndex + 1 + index, false)
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDED */}
      {recommendedSongs && recommendedSongs.length > 0 && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-4 px-1 mb-2">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase flex items-center gap-2 shrink-0">
              <Sparkles className="w-3.5 h-3.5" /> Because you're playing
            </h3>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>
          <div className="space-y-1.5">
            {recommendedSongs.map((song, index) => (
              renderSongCard(song, -1, false, true)
            ))}
          </div>
        </div>
      )}

      {/* HISTORY */}
      {currentSongIndex > 0 && (
        <div className="space-y-2 pt-2 opacity-70 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4 px-1 mb-1">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase flex items-center gap-2 shrink-0">
              <History className="w-3.5 h-3.5" /> History
            </h3>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>
          <div className="space-y-0.5 grayscale hover:grayscale-0 transition-all">
            {queue.slice(0, currentSongIndex).reverse().map((song, index) => (
              renderSongCard(song, currentSongIndex - 1 - index, false)
            ))}
          </div>
        </div>
      )}
    </>
  );
};
