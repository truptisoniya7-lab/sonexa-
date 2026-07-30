'use client';
import { motion } from 'framer-motion';

export function BackgroundGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#050505]">
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.15) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)',
          backgroundSize: '200% 200%'
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-1/4 -left-1/4 w-[100vw] h-[100vh] rounded-full bg-primary/20 blur-[150px] mix-blend-screen"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute -bottom-1/4 -right-1/4 w-[100vw] h-[100vh] rounded-full bg-blue-600/20 blur-[150px] mix-blend-screen"
      />
    </div>
  );
}
