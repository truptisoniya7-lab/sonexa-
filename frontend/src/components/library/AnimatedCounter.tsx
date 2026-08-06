'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  duration?: number;
  onClick?: () => void;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, label, icon, duration = 2, onClick }) => {
  const [hasStarted, setHasStarted] = useState(false);
  
  // Use a spring for organic movement instead of linear tweening
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });
  
  const display = useTransform(spring, (current) => Math.floor(current).toLocaleString());

  useEffect(() => {
    // Small delay to allow page load before counting
    const timer = setTimeout(() => {
      setHasStarted(true);
      spring.set(value);
    }, 200);
    return () => clearTimeout(timer);
  }, [value, spring]);

  return (
    <div onClick={onClick} className={`flex flex-col gap-1 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors group ${onClick ? 'cursor-pointer hover:border-white/[0.15]' : 'cursor-default'}`}>
      <div className="flex items-center gap-2 text-white/50 text-[11px] font-bold uppercase tracking-wider mb-1">
        <span className="opacity-70 group-hover:opacity-100 transition-opacity group-hover:text-primary">{icon}</span>
        {label}
      </div>
      <motion.div className="text-2xl font-extrabold text-white tracking-tight drop-shadow-sm">
        {display}
      </motion.div>
    </div>
  );
};
