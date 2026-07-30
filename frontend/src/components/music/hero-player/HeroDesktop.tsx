import { motion } from 'framer-motion';
import { Mic2 } from 'lucide-react';
import { SharedArtwork } from './SharedArtwork';
import { SharedMetadata } from './SharedMetadata';

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
        <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50 drop-shadow-glow">
          {greeting}, {userName} 👋
        </h1>
        <p className="text-muted-foreground mt-2 mb-4 font-medium text-lg">Ready for your next vibe?</p>
      </div>

      <motion.div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        className="relative overflow-visible rounded-3xl border border-white/10 glass-panel p-8 flex flex-row items-center gap-12 cursor-pointer group shadow-glass-hover transition-dominant duration-700 h-[320px]"
      >
        {/* Animated Glow Background behind the card */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-30 mix-blend-screen pointer-events-none transition-dominant duration-700 blur-[80px]"
          style={{ backgroundColor: `rgb(${dominantColor})` }}
        />

        <SharedArtwork 
          activeSong={activeSong}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          dominantColor={dominantColor}
          className="w-56 h-56"
          vinylClassName="right-[-40px] w-48 h-48"
        />

        <div className="flex flex-1 justify-between items-center z-10 pl-4 pr-8">
          <SharedMetadata 
            activeSong={activeSong}
            currentSong={currentSong}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            dominantColor={dominantColor}
            isMobileLayout={false}
          />
          
          {/* Unused space filled with lyrics preview / animated visualizer */}
          <div className="hidden xl:flex flex-col gap-4 max-w-sm shrink-0">
            <div className="glass-panel px-5 py-4 rounded-2xl border border-white/10 shadow-xl hover:border-white/30 transition-colors bg-background/20 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <Mic2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm font-medium text-white/90 italic leading-relaxed">
                  "I'm working late 'cause I'm a singer... <br/>
                  <span className="text-primary font-bold">Oh, he looks so cute wrapped around my finger...</span>"
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
