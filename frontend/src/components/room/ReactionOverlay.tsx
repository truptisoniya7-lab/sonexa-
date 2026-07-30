import React, { useMemo } from 'react';
import { RoomReaction } from '@/types/room';
import { motion, AnimatePresence } from 'framer-motion';

interface ReactionOverlayProps {
  reactions: RoomReaction[];
}

export const ReactionOverlay: React.FC<ReactionOverlayProps> = ({ reactions }) => {
  return (
    <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden">
      <AnimatePresence>
        {reactions.map(reaction => {
          // Generate deterministic but pseudo-random values based on the reaction ID
          // to ensure the animation path varies nicely across the screen.
          const seed = parseInt(reaction.id.replace(/[^0-9]/g, '')) || Math.random() * 1000;
          const randomX = (seed % 40) - 20; // -20 to +20 random horizontal drift
          const startRotation = (seed % 60) - 30; // -30 to +30 start rotation
          const endRotation = ((seed * 2) % 180) - 90; // -90 to +90 end rotation
          const duration = 2.5 + ((seed % 10) / 10); // 2.5s to 3.5s duration

          return (
            <motion.div
              key={reaction.id}
              className="absolute bottom-10 text-4xl sm:text-5xl drop-shadow-2xl"
              style={{ left: `${reaction.right}%` }} // reusing the 'right' prop as a horizontal % position
              initial={{ 
                opacity: 0, 
                y: 50, 
                x: 0, 
                scale: 0.5, 
                rotate: startRotation 
              }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                y: -window.innerHeight * 0.8, // Float 80% up the screen
                x: randomX, 
                scale: [0.5, 1.2, 1.5, 1.5], 
                rotate: endRotation 
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: duration, 
                ease: "easeOut" 
              }}
            >
              {reaction.emoji}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
