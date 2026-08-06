'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { MusicCrystal } from './MusicCrystal';

interface LibraryHeroCanvasProps {
  currentSong?: any;
  theme: any;
}

export const LibraryHeroCanvas: React.FC<LibraryHeroCanvasProps> = ({ currentSong, theme }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <div className="w-[260px] h-[260px] md:w-[320px] md:h-[320px] shrink-0 relative">
      {isVisible ? (
        <Canvas
          camera={{ position: [0, 0, 7], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={1.5} color={theme.light} />
          <directionalLight position={[5, 5, 5]} intensity={2} color={theme.highlight} />
          <pointLight position={[-5, -5, -2]} intensity={1} color={theme.primary} />
          
          <Suspense fallback={null}>
            <MusicCrystal imageUrl={currentSong?.song_image} theme={theme} />
            
            <EffectComposer disableNormalPass>
              <Bloom 
                luminanceThreshold={0.5} 
                mipmapBlur 
                intensity={0.4} // Very subtle bloom to avoid blinding the UI
                radius={0.4} 
              />
            </EffectComposer>
          </Suspense>
        </Canvas>
      ) : (
        // Placeholder when tab is hidden to save battery
        <div className="w-full h-full rounded-full border border-white/10 flex items-center justify-center text-white/20 text-xs">
          Paused
        </div>
      )}
    </div>
  );
};
