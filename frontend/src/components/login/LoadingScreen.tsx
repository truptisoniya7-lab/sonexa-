'use client';
import { motion } from 'framer-motion';

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 2, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]"
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Particles gathering */}
        <motion.div
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center blur-xl"
        >
          <div className="w-32 h-32 bg-primary/40 rounded-full" />
        </motion.div>
        
        {/* Logo Text */}
        <motion.div
          initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative z-10"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Sonexa
          </h1>
        </motion.div>
        
        {/* Underline Expand */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="h-1 bg-gradient-to-r from-primary to-blue-500 mt-2 rounded-full"
        />
      </div>
    </motion.div>
  );
}
