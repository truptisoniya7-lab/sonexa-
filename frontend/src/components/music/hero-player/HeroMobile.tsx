import { motion } from 'framer-motion';
import { SharedArtwork } from './SharedArtwork';
import { MobileMetadata } from './SharedMetadata';

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
    <div className="flex flex-col gap-3 relative z-10 preserve-3d mt-1 px-1 lg:hidden">
      <motion.div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        className="relative overflow-visible rounded-[24px] border border-white/10 glass-panel p-3 flex flex-row items-center gap-4 cursor-pointer group shadow-glass-hover transition-dominant duration-700"
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
          className="w-[72px] h-[72px] shrink-0"
          hideVinyl={true}
        />

        <MobileMetadata 
          activeSong={activeSong}
          currentSong={currentSong}
          greeting={greeting}
          userName={userName}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          dominantColor={dominantColor}
        />
      </motion.div>
    </div>
  );
}
