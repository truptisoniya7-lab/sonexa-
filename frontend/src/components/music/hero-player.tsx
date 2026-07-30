'use client';

import { usePlayer } from '@/context/PlayerContext';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { PlayCircle, PauseCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FastAverageColor } from 'fast-average-color';

export function HeroPlayer() {
  const { currentSong, isPlaying, togglePlay } = usePlayer();
  
  const [dominantColor, setDominantColor] = useState('139, 92, 246'); // Default purple rgb

  useEffect(() => {
    if (currentSong?.song_image) {
      const fac = new FastAverageColor();
      fac.getColorAsync(currentSong.song_image, { algorithm: 'dominant' })
        .then(color => {
          // Update global CSS variable for the 700ms smooth transition
          const rgb = `${color.value[0]}, ${color.value[1]}, ${color.value[2]}`;
          document.documentElement.style.setProperty('--dominant-color', rgb);
          setDominantColor(rgb);
        })
        .catch(e => console.error('Error extracting color:', e));
    }
  }, [currentSong?.song_image]);

  // 3D Parallax Tilt Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  function handleMouseMove(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  if (!currentSong) {
    return (
      <header className="flex flex-col gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50 drop-shadow-glow">
            Good day, Soniya 👋
          </h1>
        </div>
      </header>
    );
  }

  return (
    <header className="flex flex-col gap-6 relative z-10 preserve-3d">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50 drop-shadow-glow mb-4">
          Good day, Soniya 👋
        </h1>
      </div>

      <motion.div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        className="relative overflow-visible rounded-3xl border border-white/10 glass-panel p-8 flex flex-col sm:flex-row items-center gap-8 cursor-pointer group shadow-glass-hover transition-dominant duration-700"
      >
        {/* Animated Glow Background behind the card */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-30 mix-blend-screen pointer-events-none transition-dominant duration-700 blur-[80px]"
          style={{ backgroundColor: `rgb(${dominantColor})` }}
        />

        {/* 3D Floating Album Art */}
        <motion.div 
          style={{ translateZ: 50 }}
          className="relative w-48 h-48 shrink-0 rounded-2xl overflow-visible shadow-2xl"
        >
          {/* Animated Waveform Ring when playing */}
          {isPlaying && (
            <div className="absolute -inset-4 border-2 border-dashed border-primary/50 rounded-full animate-spin-slow opacity-50 pointer-events-none" style={{ animationDuration: '10s' }} />
          )}
          
          <img 
            src={currentSong.song_image} 
            alt="Track" 
            className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 shadow-glow" 
            style={{ boxShadow: `0 0 40px rgba(${dominantColor}, 0.5)` }}
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
            {isPlaying ? (
              <PauseCircle className="w-16 h-16 text-white drop-shadow-lg" />
            ) : (
              <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
            )}
          </div>
        </motion.div>

        {/* Track Info */}
        <motion.div style={{ translateZ: 30 }} className="flex-1 text-center sm:text-left space-y-3 z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-primary drop-shadow-md">Currently Playing</span>
          <h2 className="text-4xl font-black text-white drop-shadow-md">{currentSong.song_title}</h2>
          <p className="text-lg text-muted-foreground font-medium">{currentSong.song_artist}</p>
          
          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
              className="rounded-full font-bold px-8 py-3 bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2"
            >
              {isPlaying ? 'Pause' : 'Resume'}
            </button>
            {/* Mock Live Equalizer */}
            {isPlaying && (
              <div className="flex items-end gap-1 h-6">
                 {[...Array(6)].map((_, i) => (
                   <motion.div 
                     key={i}
                     animate={{ height: ['20%', '100%', '20%'] }} 
                     transition={{ repeat: Infinity, duration: 0.5 + Math.random(), ease: "easeInOut" }} 
                     className="w-1.5 bg-primary rounded-t-sm" 
                   />
                 ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </header>
  );
}
