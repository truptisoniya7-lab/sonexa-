'use client';

import { motion } from 'framer-motion';
import { Music, Music2, Music3, Mic2, PlayCircle, Disc3 } from 'lucide-react';

export function FloatingMusicBackground() {
  const icons = [Music, Music2, Music3, Mic2, PlayCircle, Disc3];
  
  // Create an array of random floating elements
  const floatingElements = Array.from({ length: 15 }).map((_, i) => {
    const Icon = icons[i % icons.length];
    const size = Math.random() * 20 + 20; // 20px to 40px
    const initialX = Math.random() * 100; // 0% to 100%
    const initialY = Math.random() * 100; // 0% to 100%
    const duration = Math.random() * 10 + 15; // 15s to 25s
    const delay = Math.random() * -20; // Start at different times
    const colorClass = ['text-primary/20', 'text-accent/20', 'text-purple-400/20', 'text-blue-400/20'][i % 4];

    return (
      <motion.div
        key={i}
        className={`absolute ${colorClass}`}
        initial={{
          x: `${initialX}vw`,
          y: `${initialY}vh`,
          rotate: 0,
          scale: 0.5,
          opacity: 0
        }}
        animate={{
          x: [`${initialX}vw`, `${initialX + (Math.random() * 20 - 10)}vw`, `${initialX}vw`],
          y: [`${initialY}vh`, `${initialY - 30}vh`, `${initialY + 10}vh`, `${initialY}vh`],
          rotate: [0, 180, 360],
          scale: [0.5, 1, 0.5],
          opacity: [0, 0.8, 0]
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Icon size={size} strokeWidth={1.5} />
      </motion.div>
    );
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0B0B0F] to-[#120524] animate-gradient-slow" />
      {floatingElements}
    </div>
  );
}
