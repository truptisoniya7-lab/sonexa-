import { motion } from 'framer-motion';
import { Music2, Heart, Plus, MoreHorizontal } from 'lucide-react';
import { parseTrackMetadata } from '@/lib/metadataParser';

interface MetadataProps {
  activeSong: any;
  currentSong: any;
  greeting?: string;
  userName?: string;
  isPlaying: boolean;
  togglePlay: () => void;
  dominantColor: string;
}

export function MobileMetadata({ 
  activeSong, 
  greeting, 
  userName, 
  isPlaying, 
  togglePlay, 
  dominantColor
}: MetadataProps) {
  const { song_title, song_artist } = parseTrackMetadata(activeSong.song_title, activeSong.song_artist);

  return (
    <motion.div style={{ translateZ: 30 }} className="flex-1 z-10 flex flex-col justify-center text-left space-y-2 min-w-0">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary drop-shadow-md flex items-center gap-2 mb-1">
          <Music2 className="w-3 h-3" /> {greeting}, {userName} 👋
        </span>
        <h2 className="text-[18px] font-black text-white drop-shadow-md mb-0.5 truncate">{song_title}</h2>
        <p className="text-xs text-muted-foreground font-medium truncate">{song_artist}</p>
      </div>
      
      <div className="flex items-center gap-4 pt-1">
        <button 
          onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
          className="rounded-full font-bold transition-all shadow-xl flex items-center justify-center gap-2 px-5 py-1.5 text-xs bg-gradient-to-r from-primary to-primary/80 text-white border border-white/20"
        >
          {isPlaying ? 'Pause' : 'Resume'}
        </button>
        
        {isPlaying && (
          <div className="flex items-center gap-[3px] h-8">
             {[...Array(12)].map((_, i) => (
               <motion.div 
                 key={i}
                 animate={{ height: ['20%', '100%', '30%', '80%', '20%'] }} 
                 transition={{ repeat: Infinity, duration: 0.8 + Math.random() * 0.5, ease: "easeInOut" }} 
                 className="w-1.5 rounded-full"
                 style={{ backgroundColor: `rgb(${dominantColor})` }} 
               />
             ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function DesktopMetadata({ 
  activeSong, 
  isPlaying, 
  togglePlay, 
  dominantColor
}: MetadataProps) {
  const { song_title, song_artist, song_album } = parseTrackMetadata(activeSong.song_title, activeSong.song_artist);
  // Real duration from metadata if available, else omit
  const duration = activeSong.duration ? activeSong.duration : null;

  return (
    <motion.div style={{ translateZ: 30 }} className="flex-1 z-10 flex flex-col justify-center text-left space-y-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-primary drop-shadow-md flex items-center gap-2 justify-start mb-2">
          <Music2 className="w-3 h-3" /> NOW PLAYING
          {isPlaying && (
            <div className="flex items-end gap-[2px] h-3 ml-2">
               {[...Array(4)].map((_, i) => (
                 <motion.div 
                   key={i}
                   animate={{ height: ['30%', '100%', '40%', '80%', '30%'] }} 
                   transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, ease: "easeInOut" }} 
                   className="w-[3px] rounded-t-sm"
                   style={{ backgroundColor: `rgb(${dominantColor})` }} 
                 />
               ))}
            </div>
          )}
        </span>
        
        <h2 className="text-4xl font-black text-white drop-shadow-md mb-2 truncate">{song_title}</h2>
        <p className="text-xl text-muted-foreground font-medium truncate">{song_artist}</p>
        
        <p className="text-sm text-white/50 font-medium mt-1">
          {song_album} {duration && `• ${duration}`}
        </p>
      </div>
      
      <div className="flex items-center gap-4 pt-2">
        <button 
          className="rounded-full bg-white/5 hover:bg-white/10 p-3 transition-colors shadow-sm text-white border border-white/10"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <Heart className="w-5 h-5" />
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
          className="rounded-full font-bold transition-all shadow-xl flex items-center justify-center gap-2 px-8 py-3 bg-white text-black hover:scale-105 active:scale-95"
        >
          {isPlaying ? 'Pause' : 'Play Now'}
        </button>
        
        <button 
          className="rounded-full bg-white/5 hover:bg-white/10 px-4 py-2.5 transition-colors shadow-sm text-white border border-white/10 flex items-center gap-2 text-sm font-medium"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <Plus className="w-4 h-4" /> Add to Queue
        </button>

        <button 
          className="rounded-full bg-transparent hover:bg-white/10 p-2.5 transition-colors text-white/70 hover:text-white"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
