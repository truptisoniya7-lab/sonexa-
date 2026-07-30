import { motion, AnimatePresence } from 'framer-motion';
import { Mic2, Disc3 } from 'lucide-react';
import { SharedArtwork } from './SharedArtwork';
import { DesktopMetadata } from './SharedMetadata';

interface HeroDesktopProps {
  activeSong: any;
  currentSong: any;
  isPlaying: boolean;
  togglePlay: () => void;
  dominantColor: string;
  greeting: string;
  userName: string;
  handleMouseMove: (e: any) => void;
  handleMouseLeave: () => void;
  rotateX: any;
  rotateY: any;
}

export function HeroDesktop({
  activeSong,
  currentSong,
  isPlaying,
  togglePlay,
  dominantColor,
  greeting,
  userName,
  handleMouseMove,
  handleMouseLeave,
  rotateX,
  rotateY
}: HeroDesktopProps) {
  return (
    <div className="hidden lg:flex flex-col gap-6 relative z-10 preserve-3d">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white/90 drop-shadow-sm">
          {greeting} 👋
        </h1>
        <p className="text-muted-foreground mt-1 mb-2 font-medium text-lg">Welcome back, {userName}</p>
      </div>

      <motion.div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        className="relative overflow-visible rounded-3xl border border-white/10 glass-panel p-8 flex flex-row items-center gap-12 cursor-pointer group shadow-glass-hover transition-dominant duration-700 h-[280px]"
      >
        {/* Animated Glow Background behind the card */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-40 mix-blend-screen pointer-events-none transition-dominant duration-700 blur-[80px]"
          style={{ 
            background: `radial-gradient(circle at 30% 50%, rgb(${dominantColor}), transparent 70%)` 
          }}
        />
        {/* Subtle animated gradient overlay */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-20 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"
        />

        <SharedArtwork 
          activeSong={activeSong}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          dominantColor={dominantColor}
          className="w-64 h-64"
          vinylClassName="right-[-40px] w-56 h-56"
        />

        <div className="flex flex-1 justify-between items-center z-10 pl-4 pr-8">
          <DesktopMetadata 
            activeSong={activeSong}
            currentSong={currentSong}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            dominantColor={dominantColor}
          />
          
          {/* Smarter Info / Lyrics Card */}
          <div className="hidden xl:flex flex-col gap-4 max-w-sm shrink-0 w-[300px]">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeSong.song_uri}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-panel px-5 py-5 rounded-2xl border border-white/10 shadow-xl hover:border-white/30 transition-colors bg-background/30 backdrop-blur-md"
              >
                {activeSong.lyrics ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
                      <Mic2 className="w-4 h-4" /> Lyrics Preview
                    </div>
                    <div className="text-sm font-medium text-white/90 italic leading-relaxed">
                      "I'm working late 'cause I'm a singer... <br/>
                      <span className="text-primary font-bold">Oh, he looks so cute wrapped around my finger...</span>"
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-white/70 font-bold text-xs uppercase tracking-wider mb-1">
                      <Disc3 className="w-4 h-4" /> Track Info
                    </div>
                    <div className="flex flex-col gap-1 text-sm font-medium text-white/90">
                      <div className="flex justify-between">
                        <span className="text-white/50">Album</span>
                        <span className="truncate max-w-[150px]">{activeSong.song_album || 'Single'}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-white/50">Released</span>
                        <span>{activeSong.year || '2024'}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-white/50">Duration</span>
                        <span>{activeSong.duration || '3:45'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
