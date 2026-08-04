import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlbumArtworkProps {
  imageUrl: string;
  title: string;
  isPlaying: boolean;
}

export function AlbumArtwork({ imageUrl, title, isPlaying }: AlbumArtworkProps) {
  return (
    <div className="relative w-full max-w-[500px] xl:max-w-[600px] aspect-square mx-auto mb-8">
      {/* Dynamic Colored Glow behind the artwork */}
      <motion.div 
        className="absolute inset-0 rounded-2xl opacity-60 blur-3xl saturate-200"
        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover' }}
        animate={{
          scale: [0.95, 1.05, 0.95],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Main Artwork Container with Floating Animation */}
      <motion.div
        className="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
        animate={{
          y: isPlaying ? [-5, 5, -5] : 0,
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
      >
        <AnimatePresence mode="popLayout">
          <motion.img 
            key={imageUrl}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover absolute inset-0"
          />
        </AnimatePresence>
        
        {/* Subtle glass reflection on the artwork */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none mix-blend-overlay z-20" />
      </motion.div>

      {/* Floating Music Visualizer Below Artwork */}
      {isPlaying && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-1.5 h-6">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-primary/80 rounded-t-sm"
              animate={{
                height: [
                  `${Math.random() * 40 + 20}%`, 
                  `${Math.random() * 80 + 20}%`, 
                  `${Math.random() * 40 + 20}%`
                ]
              }}
              transition={{
                duration: Math.random() * 0.5 + 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 0.2
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
