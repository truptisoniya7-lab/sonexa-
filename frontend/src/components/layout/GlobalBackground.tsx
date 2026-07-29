'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music2, Music, Mic2 } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { FastAverageColor } from 'fast-average-color';

export function GlobalBackground() {
  const { currentSong } = usePlayer();
  const [bgColor, setBgColor] = useState('rgba(147, 51, 234, 0.3)'); // Default purple
  const [altColor, setAltColor] = useState('rgba(79, 70, 229, 0.3)'); // Default indigo

  useEffect(() => {
    if (currentSong?.song_image) {
      const fac = new FastAverageColor();
      fac.getColorAsync(currentSong.song_image, { algorithm: 'dominant' })
        .then(color => {
          // Reduce saturation by using rgba with 0.2/0.3 alpha (20-30%)
          setBgColor(`rgba(${color.value[0]}, ${color.value[1]}, ${color.value[2]}, 0.3)`);
          // Generate an alternative color (shifted slightly)
          setAltColor(`rgba(${color.value[2]}, ${color.value[0]}, ${color.value[1]}, 0.3)`);
        })
        .catch(e => console.error('Error extracting color:', e));
    }
  }, [currentSong?.song_image]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#0a0a0f] transition-colors duration-1000">
      {/* 1. Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* 2. Blurred Gradients reacting to music art */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1], backgroundColor: bgColor }} 
        transition={{ 
          duration: 15, repeat: Infinity, ease: "easeInOut",
          backgroundColor: { duration: 0.8, ease: "easeInOut" } // 800ms transition as requested
        }}
        className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] mix-blend-screen"
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1], backgroundColor: altColor }} 
        transition={{ 
          duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5,
          backgroundColor: { duration: 0.8, ease: "easeInOut" }
        }}
        className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] mix-blend-screen"
      />

      {/* 3. Animated Blobs (Glowing Circles) */}
      <motion.div
        animate={{ 
          x: [0, 100, 0, -100, 0], 
          y: [0, -50, 100, 50, 0],
          backgroundColor: bgColor 
        }}
        transition={{ 
          duration: 25, repeat: Infinity, ease: "linear",
          backgroundColor: { duration: 0.8, ease: "easeInOut" }
        }}
        className="absolute top-[20%] left-[30%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-50"
      />

      {/* 4. Slow moving music notes */}
      <motion.div 
        animate={{ y: ['110vh', '-10vh'], x: [0, 50, -50, 0], rotate: [0, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute left-[15%] opacity-5"
      >
        <Music2 className="w-16 h-16 text-purple-300" />
      </motion.div>
      <motion.div 
        animate={{ y: ['110vh', '-10vh'], x: [0, -40, 40, 0], rotate: [0, -360] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear", delay: 10 }}
        className="absolute right-[25%] opacity-5"
      >
        <Music className="w-24 h-24 text-indigo-300" />
      </motion.div>
      <motion.div 
        animate={{ y: ['110vh', '-10vh'], x: [0, 30, -30, 0], rotate: [0, 180] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear", delay: 5 }}
        className="absolute right-[10%] opacity-5"
      >
        <Mic2 className="w-12 h-12 text-pink-300" />
      </motion.div>

      {/* 5. Floating Equalizer Bars */}
      <div className="absolute bottom-[10%] left-[40%] flex gap-2 opacity-10">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            animate={{ height: ['20px', `${Math.random() * 80 + 40}px`, '20px'] }}
            transition={{ duration: 1.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
            className="w-2 bg-gradient-to-t from-purple-500 to-indigo-400 rounded-full"
            style={{ height: '20px' }}
          />
        ))}
      </div>
    </div>
  );
}
