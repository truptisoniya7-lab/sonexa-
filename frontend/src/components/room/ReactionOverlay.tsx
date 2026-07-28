import React from 'react';
import { RoomReaction } from '@/types/room';

interface ReactionOverlayProps {
  reactions: RoomReaction[];
}

export const ReactionOverlay: React.FC<ReactionOverlayProps> = ({ reactions }) => {
  return (
    <>
      {reactions.map(reaction => (
        <div 
          key={reaction.id} 
          className="absolute bottom-32 text-4xl z-[100] pointer-events-none drop-shadow-2xl" 
          style={{ 
            right: `${reaction.right}%`, 
            animation: 'floatReaction 3s ease-out forwards' 
          }}
        >
          {reaction.emoji}
        </div>
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatReaction { 
          0% { opacity: 1; transform: translateY(0) scale(0.5) rotate(-10deg); } 
          50% { transform: translateY(-150px) scale(1.2) rotate(10deg); }
          100% { opacity: 0; transform: translateY(-300px) scale(1.5) rotate(-5deg); } 
        }
      `}} />
    </>
  );
};
