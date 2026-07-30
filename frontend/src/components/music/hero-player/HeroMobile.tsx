import { motion } from 'framer-motion';
import { SharedArtwork } from './SharedArtwork';
import { SharedMetadata } from './SharedMetadata';

interface HeroMobileProps {
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

export function HeroMobile({
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
}: HeroMobileProps) {
  return (
    <div className="flex flex-col gap-4 relative z-10 preserve-3d mt-2 px-2 lg:hidden">
      <motion.div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        className="relative overflow-visible rounded-3xl border border-white/10 glass-panel p-4 md:p-6 flex flex-row items-center gap-6 cursor-pointer group shadow-glass-hover transition-dominant duration-700 max-h-[220px]"
      >
        {/* Animated Glow Background behind the card */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-20 mix-blend-screen pointer-events-none transition-dominant duration-700 blur-[100px]"
          style={{ backgroundColor: `rgb(${dominantColor})` }}
        />

        <SharedArtwork 
          activeSong={activeSong}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          dominantColor={dominantColor}
          className="w-28 h-28 shrink-0 hidden sm:flex"
          vinylClassName="right-[-20px] w-24 h-24"
        />

        <SharedMetadata 
          activeSong={activeSong}
          currentSong={currentSong}
          greeting={greeting}
          userName={userName}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          dominantColor={dominantColor}
          isMobileLayout={true}
        />
      </motion.div>
    </div>
  );
}
