'use client';
import { useEffect, useState } from 'react';

export type PerformanceTier = 'high' | 'medium' | 'low' | 'mobile';

export function usePerformanceTier(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>('medium');

  useEffect(() => {
    // Basic heuristics for performance tier
    const isMobile = window.innerWidth <= 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    // @ts-ignore
    const deviceMemory = navigator.deviceMemory || 4;

    if (prefersReducedMotion || isMobile) {
      setTier('mobile');
    } else if (hardwareConcurrency >= 8 && deviceMemory >= 8) {
      setTier('high');
    } else if (hardwareConcurrency >= 4) {
      setTier('medium');
    } else {
      setTier('low');
    }
  }, []);

  return tier;
}
