'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PerformanceMonitor } from '@react-three/drei';

export type PerformanceTier = 'ultra' | 'high' | 'medium' | 'lite';

interface PerformanceContextType {
  tier: PerformanceTier;
  dpr: number;
  particleCount: number;
  enableBloom: boolean;
  enableComplexShaders: boolean;
}

const defaultContext: PerformanceContextType = {
  tier: 'high',
  dpr: 1.5,
  particleCount: 1500,
  enableBloom: true,
  enableComplexShaders: true,
};

const PerformanceContext = createContext<PerformanceContextType>(defaultContext);

export const usePerformance = () => useContext(PerformanceContext);

export const PerformanceManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tier, setTier] = useState<PerformanceTier>('high');
  const [dpr, setDpr] = useState(1.5);

  const getSettingsForTier = (t: PerformanceTier): PerformanceContextType => {
    switch (t) {
      case 'ultra':
        return { tier: 'ultra', dpr: 2, particleCount: 3000, enableBloom: true, enableComplexShaders: true };
      case 'high':
        return { tier: 'high', dpr, particleCount: 1500, enableBloom: true, enableComplexShaders: true };
      case 'medium':
        return { tier: 'medium', dpr: 1, particleCount: 500, enableBloom: true, enableComplexShaders: false };
      case 'lite':
        return { tier: 'lite', dpr: 0.75, particleCount: 100, enableBloom: false, enableComplexShaders: false };
    }
  };

  const settings = getSettingsForTier(tier);

  // Optional: Run one-time GPU detection on mount if needed, but PerformanceMonitor handles live FPS well.
  
  return (
    <PerformanceContext.Provider value={settings}>
      {/* Drei's PerformanceMonitor tracks FPS and calls onChange with a factor between 0 and 1 */}
      <PerformanceMonitor
        onIncline={() => {
          setDpr(2);
          if (tier === 'medium') setTier('high');
          if (tier === 'lite') setTier('medium');
        }}
        onDecline={() => {
          setDpr(1);
          if (tier === 'ultra') setTier('high');
          else if (tier === 'high') setTier('medium');
          else if (tier === 'medium') setTier('lite');
        }}
        onChange={({ factor }) => {
          // Factor is 1 if perfectly hitting 60fps, 0 if struggling
          if (factor < 0.3) setTier('lite');
        }}
      >
        {children}
      </PerformanceMonitor>
    </PerformanceContext.Provider>
  );
};
