import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';

interface SharedMetadataProps {
  activeSong: any;
  currentSong: any;
  greeting?: string;
  userName?: string;
  isPlaying: boolean;
  togglePlay: () => void;
  dominantColor: string;
  isMobileLayout?: boolean;
}

export function SharedMetadata({ 
  activeSong, 
  currentSong, 
  greeting, 
  userName, 
  isPlaying, 
  togglePlay, 
  dominantColor,
  isMobileLayout
}: SharedMetadataProps) {
  return (
    <motion.div style={{ translateZ: 30 }} className={`flex-1 z-10 flex flex-col justify-center ${isMobileLayout ? 'text-left space-y-2 min-w-0' : 'text-center lg:text-left space-y-4'}`}>
      <div>
        {isMobileLayout ? (
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary drop-shadow-md flex items-center gap-2 mb-1">
            <Music2 className="w-3 h-3" /> {greeting}, {userName} 👋
          </span>
        ) : (
          <span className="text-xs font-bold uppercase tracking-widest text-primary drop-shadow-md flex items-center gap-2 justify-center lg:justify-start mb-2">
            <Music2 className="w-3 h-3" /> {currentSong ? 'Currently Playing' : 'Featured Track'}
          </span>
        )}
        
        {isMobileLayout ? (
          <>
            <h2 className="text-xl font-black text-white drop-shadow-md mb-0.5 truncate">{activeSong.song_title}</h2>
            <p className="text-sm text-muted-foreground font-medium truncate">{activeSong.song_artist}</p>
          </>
        ) : (
          <>
            <h2 className="text-4xl lg:text-5xl font-black text-white drop-shadow-md mb-2">{activeSong.song_title}</h2>
            <p className="text-xl text-muted-foreground font-medium">{activeSong.song_artist}</p>
          </>
        )}
      </div>
      
      <div className={`flex items-center gap-4 ${isMobileLayout ? 'pt-1' : 'pt-2 lg:pt-4 justify-center lg:justify-start'}`}>
        <button 
          onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
          className={`rounded-full font-bold bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 ${isMobileLayout ? 'px-6 py-2 text-sm' : 'px-8 py-3'}`}
        >
          {isPlaying ? 'Pause' : 'Resume'}
        </button>
        
        {/* Fluid Waveform */}
        {isPlaying && (
          <div className={`flex items-center gap-[3px] ${isMobileLayout ? 'h-8' : 'h-10'}`}>
             {[...Array(isMobileLayout ? 12 : 16)].map((_, i) => (
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
