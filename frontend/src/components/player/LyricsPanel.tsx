import React, { useEffect, useRef } from 'react';
import { PlayerSong } from '../../services/PlayerService';
import { Mic2, Loader2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

interface LyricsPanelProps {
  song: PlayerSong;
  isLoading?: boolean;
}

// Mock lyrics for demonstration of the synced UI
const MOCK_LYRICS = [
  { time: 0, text: "♪" },
  { time: 10, text: "I've been waiting for this moment" },
  { time: 15, text: "All my life, oh Lord" },
  { time: 21, text: "Can you feel it coming in the air tonight?" },
  { time: 28, text: "Oh Lord, oh Lord" },
  { time: 35, text: "Well I've been waiting for this moment" },
  { time: 41, text: "All my life, oh Lord" },
  { time: 50, text: "♪ (Instrumental break) ♪" },
  { time: 70, text: "I can feel it coming in the air tonight" },
  { time: 76, text: "Oh Lord" },
  { time: 82, text: "Well I've been waiting for this moment" },
  { time: 89, text: "All my life, oh Lord" }
];

export function LyricsPanel({ song, isLoading = false }: LyricsPanelProps) {
  const { progress, seekTo } = usePlayer();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Find the active line based on current progress
  const activeIndex = MOCK_LYRICS.reduce((acc, line, idx) => {
    if (progress >= line.time) return idx;
    return acc;
  }, 0);

  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      // Smoothly scroll the active line into view
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  return (
    <div className="w-full flex flex-col h-full overflow-hidden px-4">
      <h3 className="font-bold text-xl text-white mb-6">Lyrics</h3>
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-24 mask-image-bottom"
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-white/50 gap-4 mt-20">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Loading lyrics...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 text-2xl font-bold transition-all duration-500 pb-40 pt-10">
            {MOCK_LYRICS.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;
              
              return (
                <div 
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => seekTo(line.time)}
                  className={`
                    cursor-pointer transition-all duration-500 ease-out origin-left
                    ${isActive 
                      ? 'text-white scale-110 blur-none' 
                      : isPast 
                        ? 'text-white/30 blur-[0.5px] hover:text-white/70' 
                        : 'text-white/30 blur-[1px] hover:text-white/70'}
                  `}
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
