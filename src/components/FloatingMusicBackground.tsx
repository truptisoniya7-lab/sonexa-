'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const NOTES = ['🎵', '🎶', '♩', '♪', '♫', '♬', '🎸', '🎹', '🎧', '🎤', '🎺', '🎷'];

interface FloatingNote {
  id: number;
  x: number;
  y: number;
  note: string;
  size: number;
  duration: number;
  delay: number;
}

export function FloatingMusicBackground() {
  const [notes, setNotes] = useState<FloatingNote[]>([]);

  useEffect(() => {
    // Generate initial notes
    const generateNotes = () => {
      const newNotes: FloatingNote[] = [];
      for (let i = 0; i < 25; i++) {
        newNotes.push({
          id: i,
          x: Math.random() * 100, // percentage
          y: Math.random() * 100, // percentage
          note: NOTES[Math.floor(Math.random() * NOTES.length)],
          size: Math.random() * 3 + 2, // 2rem to 5rem
          duration: Math.random() * 25 + 15, // seconds
          delay: Math.random() * -20, // random start time
        });
      }
      setNotes(newNotes);
    };

    generateNotes();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {notes.map((note) => (
        <motion.div
          key={note.id}
          className="absolute text-primary"
          style={{
            left: `${note.x}%`,
            top: `${note.y}%`,
            fontSize: `${note.size}rem`,
            filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))'
          }}
          animate={{
            y: ['0%', '-50%', '0%'],
            x: ['0%', '10%', '-10%', '0%'],
            rotate: [0, 45, -45, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: note.duration,
            delay: note.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {note.note}
        </motion.div>
      ))}
    </div>
  );
}
