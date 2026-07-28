import React from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

interface NowPlayingCinematicProps {
  currentSong: any;
  playerMode: 'artwork' | 'lyrics';
  progress: number;
}

export const NowPlayingCinematic: React.FC<NowPlayingCinematicProps> = ({ currentSong, playerMode, progress }) => {
  return (
    <>
      {/* Main Video/Artwork Container */}
      <div className="w-full lg:w-[85%] mx-auto aspect-video relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-black shrink-0 flex items-center justify-center">
        
        {/* No Song State */}
        <div 
          className="absolute inset-0 z-0 flex flex-col items-center justify-center text-center opacity-70 bg-muted/20 transition-opacity duration-500"
          style={{ opacity: !currentSong ? 1 : 0, pointerEvents: !currentSong ? 'auto' : 'none' }}
        >
          <div className="w-32 h-32 rounded-2xl mb-4 bg-muted/50 border-2 border-dashed border-border flex items-center justify-center">
            <Music className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-bold mb-2 tracking-tight">No song playing</h2>
          <p className="text-muted-foreground text-sm max-w-xs">Add a song to the queue to start listening.</p>
        </div>

        {/* Artwork Mode */}
        <div 
          className="absolute inset-0 z-10 transition-opacity duration-500 flex items-center justify-center bg-black/40 backdrop-blur-3xl"
          style={{ 
            opacity: currentSong && playerMode === 'artwork' ? 1 : 0,
            pointerEvents: currentSong && playerMode === 'artwork' ? 'auto' : 'none'
          }}
        >
          {currentSong && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20"
            >
              <img src={currentSong.song_image?.replace('100x100', '600x600') || ''} alt="Artwork" className="w-full h-full object-cover" />
            </motion.div>
          )}
        </div>

        {/* Lyrics Container */}
        <div 
          className="absolute inset-0 z-20 flex items-center justify-center p-6 text-center overflow-hidden bg-black/80 backdrop-blur-3xl transition-opacity duration-500"
          style={{ 
            opacity: currentSong && playerMode === 'lyrics' ? 1 : 0,
            pointerEvents: currentSong && playerMode === 'lyrics' ? 'auto' : 'none'
          }}
        >
          <motion.div 
            animate={{ y: `calc(50% - ${Math.max(0, [0, 5, 10, 15, 20, 25, 30, 35, 40].findIndex(t => progress >= t && progress < t+5)) * 64}px)` }} 
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="flex flex-col gap-8 absolute top-0 w-full pt-[275px]"
          >
            {[
              { time: 0, text: "♪" },
              { time: 5, text: "Yesterday" },
              { time: 10, text: "All my troubles seemed so far away" },
              { time: 15, text: "Now it looks as though they're here to stay" },
              { time: 20, text: "Oh, I believe in yesterday" },
              { time: 25, text: "Suddenly" },
              { time: 30, text: "I'm not half the man I used to be" },
              { time: 35, text: "There's a shadow hanging over me" },
              { time: 40, text: "♪" }
            ].map((line, i) => {
              const activeLyricIndex = Math.max(0, [0, 5, 10, 15, 20, 25, 30, 35, 40].findIndex(t => progress >= t && progress < t+5));
              const isPast = i < activeLyricIndex;
              const isActive = i === activeLyricIndex;
              return (
                <p 
                  key={i} 
                  className={`text-2xl sm:text-4xl font-extrabold tracking-tight transition-all duration-700 h-[32px] flex items-center justify-center ${
                    isActive ? 'text-white scale-110 opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 
                    isPast ? 'text-white/30 scale-90 blur-[1px]' : 'text-white/40 scale-95'
                  }`}
                >
                  {line.text}
                </p>
              );
            })}
          </motion.div>
        </div>
      </div>
    </>
  );
};
