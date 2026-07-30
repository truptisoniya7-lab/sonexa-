import { motion } from 'framer-motion';
import { PlayCircle, PauseCircle } from 'lucide-react';

interface SharedArtworkProps {
  activeSong: any;
  isPlaying: boolean;
  togglePlay: () => void;
  dominantColor: string;
  className?: string; // For wrapper sizing
  vinylClassName?: string;
  hideVinyl?: boolean;
}

export function SharedArtwork({ activeSong, isPlaying, togglePlay, dominantColor, className, vinylClassName, hideVinyl }: SharedArtworkProps) {
  return (
    <motion.div 
      style={{ translateZ: 50 }}
      className={`relative shrink-0 flex items-center justify-center ${className}`}
    >
      {/* Rotating Vinyl Record */}
      {!hideVinyl && (
        <motion.div 
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className={`absolute rounded-full bg-black border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden ${vinylClassName}`}
          style={{ 
            background: 'radial-gradient(circle at center, #111 20%, #000 60%)',
            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.5)'
          }}
        >
          {/* Vinyl grooves */}
          <div className="absolute inset-2 border border-white/5 rounded-full pointer-events-none" />
          <div className="absolute inset-4 border border-white/5 rounded-full pointer-events-none" />
          <div className="absolute inset-8 border border-white/5 rounded-full pointer-events-none" />
          
          {/* Record Label */}
          <div className="w-1/3 h-1/3 rounded-full border border-black/50 flex items-center justify-center" style={{ backgroundColor: `rgb(${dominantColor})` }}>
            <div className="w-2 h-2 bg-black rounded-full" />
          </div>
        </motion.div>
      )}

      <div className="relative w-full h-full z-10 rounded-2xl overflow-hidden shadow-2xl">
        <img 
          src={activeSong.song_image} 
          alt="Track" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 shadow-glow" 
          style={{ boxShadow: `0 0 40px rgba(${dominantColor}, 0.5)` }}
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
          {isPlaying ? (
            <PauseCircle className="w-16 h-16 text-white drop-shadow-lg" />
          ) : (
            <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
