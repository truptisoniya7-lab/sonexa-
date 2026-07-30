'use client';

import { usePlayer } from '@/context/PlayerContext';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { PlayCircle, PauseCircle, Music2, Mic2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FastAverageColor } from 'fast-average-color';

export function HeroPlayer() {
  const { currentSong, isPlaying, togglePlay } = usePlayer();
  
  const [dominantColor, setDominantColor] = useState('139, 92, 246'); // Default purple rgb

  const defaultSong = {
    song_uri: 'spotify:track:default',
    song_title: 'Espresso',
    song_artist: 'Sabrina Carpenter',
    song_image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80'
  };

  const activeSong = currentSong || defaultSong;

  useEffect(() => {
    if (activeSong.song_image) {
      const fac = new FastAverageColor();
      fac.getColorAsync(activeSong.song_image, { algorithm: 'dominant' })
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

  return (
    <header className="flex flex-col gap-6 relative z-10 preserve-3d mt-4 lg:mt-0">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50 drop-shadow-glow mb-4">
          Good day, Soniya 👋
        </h1>
      </div>

      <motion.div 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        className="relative overflow-visible rounded-3xl border border-white/10 glass-panel p-8 flex flex-col md:flex-row items-center md:items-stretch gap-12 cursor-pointer group shadow-glass-hover transition-dominant duration-700"
      >
        {/* Animated Glow Background behind the card */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-20 mix-blend-screen pointer-events-none transition-dominant duration-700 blur-[100px]"
          style={{ backgroundColor: `rgb(${dominantColor})` }}
        />

        {/* 3D Floating Album Art & Vinyl */}
        <motion.div 
          style={{ translateZ: 50 }}
          className="relative w-64 h-64 shrink-0 flex items-center justify-center"
        >
          {/* Rotating Vinyl Record */}
          <motion.div 
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute right-[-40px] w-56 h-56 rounded-full bg-black border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden"
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
            <div className="w-20 h-20 rounded-full border border-black/50" style={{ backgroundColor: `rgb(${dominantColor})` }}>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 bg-black rounded-full" />
              </div>
            </div>
          </motion.div>

          <div className="relative w-full h-full z-10 rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={activeSong.song_image} 
              alt="Track" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 shadow-glow" 
              style={{ boxShadow: `0 0 40px rgba(${dominantColor}, 0.5)` }}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
              {isPlaying ? (
                <PauseCircle className="w-16 h-16 text-white drop-shadow-lg" />
              ) : (
                <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Track Info */}
        <motion.div style={{ translateZ: 30 }} className="flex-1 text-center md:text-left space-y-4 z-10 flex flex-col justify-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary drop-shadow-md flex items-center gap-2 justify-center md:justify-start mb-2">
              <Music2 className="w-3 h-3" /> {currentSong ? 'Currently Playing' : 'Featured Track'}
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-md mb-2">{activeSong.song_title}</h2>
            <p className="text-xl text-muted-foreground font-medium">{activeSong.song_artist}</p>
          </div>
          
          <div className="flex items-center gap-6 pt-2">
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
              className="rounded-full font-bold px-8 py-3 bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2"
            >
              {isPlaying ? 'Pause' : 'Resume'}
            </button>
            
            {/* Fluid Waveform */}
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

          {/* Lyrics Preview Pill */}
          <div className="mt-4 inline-flex">
            <div className="glass-panel px-4 py-3 rounded-2xl border border-white/5 flex items-start gap-3 max-w-sm hover:border-white/20 transition-colors">
              <Mic2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm font-medium text-white/80 italic leading-relaxed">
                "I'm working late 'cause I'm a singer... <br/>
                <span className="text-primary font-bold">Oh, he looks so cute wrapped around my finger...</span>"
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </header>
  );
}
