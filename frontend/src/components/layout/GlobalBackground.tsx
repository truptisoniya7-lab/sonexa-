'use client';
import { motion } from 'framer-motion';
import { Music2, Music, Mic2 } from 'lucide-react';

export function GlobalBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#0a0a0f]">
      {/* 1. Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* 2. Blurred Gradients / Purple Glow */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} 
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/30 rounded-full blur-[150px] mix-blend-screen"
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }} 
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/30 rounded-full blur-[150px] mix-blend-screen"
      />

      {/* 3. Animated Blobs (Glowing Circles) */}
      <motion.div
        animate={{ 
          x: [0, 100, 0, -100, 0], 
          y: [0, -50, 100, 50, 0] 
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[100px]"
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
