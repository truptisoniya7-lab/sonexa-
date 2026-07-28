import React, { Fragment } from 'react';
import { motion } from 'framer-motion';
import { Play, Music, User, ChevronUp, ArrowUp, X, Clock, Flame, Activity, History } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface QueuePanelProps {
  queue: any[];
  currentSongIndex: number;
  trendingSongs: any[];
  onPlaySong: (song: any) => void;
  onSetCurrentIndex: (index: number) => void;
  onVote: (id: number, dir: 'up'|'down') => void;
  onRemove: (id: number) => void;
  onAdd: (song: any) => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({ queue, currentSongIndex, trendingSongs, onPlaySong, onSetCurrentIndex, onVote, onRemove, onAdd }) => {

  const renderSongCard = (song: any, index: number, isPlaying: boolean, isTrending: boolean = false) => {
    const displayIndex = index >= 0 ? index + 1 : null;
    
    return (
      <Fragment key={song.id || `${song.song_uri}-${index}`}>
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className={`group flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors relative \${isPlaying ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-white/5'}`}
          onClick={() => {
            if (isTrending) {
              onPlaySong(song);
            } else if (index >= 0) {
              onSetCurrentIndex(index);
            }
          }}
        >
          {/* Index / Play / EQ */}
          <div className="w-6 flex justify-center shrink-0">
            {isPlaying ? (
              <div className="flex items-end justify-center gap-[2px] h-3.5 w-4 overflow-hidden">
                <motion.div animate={{ height: ["40%", "100%", "40%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} className="w-1 bg-primary rounded-t-sm" />
                <motion.div animate={{ height: ["100%", "30%", "100%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-1 bg-primary rounded-t-sm" />
                <motion.div animate={{ height: ["60%", "90%", "60%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="w-1 bg-primary rounded-t-sm" />
              </div>
            ) : (
              <div className="relative flex items-center justify-center w-full h-full">
                <span className={`text-xs font-medium text-muted-foreground group-hover:opacity-0 transition-opacity \${isTrending ? 'opacity-0' : 'opacity-100'}`}>
                  {displayIndex}
                </span>
                <Play className={`w-4 h-4 text-foreground fill-current absolute opacity-0 group-hover:opacity-100 transition-opacity \${isTrending ? 'group-hover:opacity-100 opacity-0' : ''}`} />
              </div>
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

      {/* TRENDING */}
      {trendingSongs && trendingSongs.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-4 px-1 mb-1">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-orange-400 uppercase flex items-center gap-2 shrink-0">
              <Flame className="w-3.5 h-3.5" /> Trending
            </h3>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>
          <div className="space-y-0.5">
            {trendingSongs.map((song, index) => (
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
