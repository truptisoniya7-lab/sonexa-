import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackgroundEffectsProps {
  imageUrl: string;
}

export function BackgroundEffects({ imageUrl }: BackgroundEffectsProps) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-zinc-950 pointer-events-none">
      {/* 
        Dynamic Image Blur Glow 
        Using backgroundPosition animation to create a slow shifting effect
      */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          key={imageUrl}
          className="absolute inset-[-20%] opacity-50 blur-[120px] saturate-[1.5] mix-blend-screen"
          style={{ 
            backgroundImage: `url(${imageUrl})`, 
            backgroundSize: 'cover', 
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.5,
            backgroundPosition: ['0% 0%', '100% 100%', '0% 100%', '100% 0%', '0% 0%'],
            scale: [1, 1.1, 1],
          }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.5 },
            backgroundPosition: { duration: 60, ease: "linear", repeat: Infinity },
            scale: { duration: 60, ease: "linear", repeat: Infinity },
          }}
        />
      </AnimatePresence>
      
      {/* Dark overlay gradients for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/50 via-transparent to-zinc-950/50" />
    </div>
  );
}
