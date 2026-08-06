'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  dominantColor?: string;
  isDark?: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  dominantColor = '#3b82f6', // fallback blue
  isDark = true 
}) => {
  // Create a subtle mesh gradient based on the dominant color
  const gradientStyle = useMemo(() => {
    return {
      background: `radial-gradient(circle at 15% 50%, ${dominantColor}15, transparent 50%), 
                   radial-gradient(circle at 85% 30%, ${dominantColor}10, transparent 50%),
                   radial-gradient(circle at 50% 80%, ${dominantColor}0A, transparent 50%)`,
      backgroundColor: isDark ? '#06070a' : '#0a0a0f',
    };
  }, [dominantColor, isDark]);

  // Generate lightweight CSS particles
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={gradientStyle}>
      {/* Subtle Grain Overlay for cinematic texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
      
      {/* Floating Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white opacity-20"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            boxShadow: `0 0 ${p.size * 2}px ${dominantColor}80`
          }}
          animate={{
            y: ['0%', '-20%', '0%'],
            x: ['0%', '10%', '0%'],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};
