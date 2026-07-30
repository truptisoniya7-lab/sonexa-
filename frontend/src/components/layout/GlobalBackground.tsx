'use client';

import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import { useEffect, useState } from 'react';

export function GlobalBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#050505]">
      {/* Animated subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0B0B0F] to-[#1a0b2e] opacity-80 animate-gradient-slow" />
      
      {/* Soft purple glow in the center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen opacity-50" />

      {/* Tiny moving music notes / particles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const size = Math.random() * 10 + 10;
        const initialX = Math.random() * 100;
        const initialY = Math.random() * 100;
        const duration = Math.random() * 20 + 20;
        const delay = Math.random() * -30;

        return (
          <motion.div
            key={i}
            className="absolute text-primary/10"
            initial={{
              x: `${initialX}vw`,
              y: `${initialY}vh`,
              rotate: 0,
              scale: 0.5,
              opacity: 0
            }}
            animate={{
              x: [`${initialX}vw`, `${initialX + (Math.random() * 20 - 10)}vw`, `${initialX}vw`],
              y: [`${initialY}vh`, `${initialY - 20}vh`, `${initialY + 10}vh`, `${initialY}vh`],
              rotate: [0, 180, 360],
              scale: [0.5, 1, 0.5],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Music size={size} strokeWidth={1} />
          </motion.div>
        );
      })}
    </div>
  );
}
