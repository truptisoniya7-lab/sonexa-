'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { MusicCore } from './MusicCore';
import { Galaxy } from './Galaxy';
import { Lighting } from './Lighting';
import { AudioRings } from './AudioRings';
import { CinematicCamera } from './CinematicCamera';
import { PerformanceManager } from '../performance/PerformanceManager';
import { OrbitingAvatars } from './OrbitingAvatars';

interface RoomCanvasProps {
  currentSong: any;
  isPlaying: boolean;
  theme: any;
  members: any[];
}

export const RoomCanvas: React.FC<RoomCanvasProps> = ({ currentSong, isPlaying, theme, members }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundColor: theme.dark }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <PerformanceManager>
          <Suspense fallback={null}>
            <CinematicCamera currentSong={currentSong} isPlaying={isPlaying} />
            <Lighting theme={theme} isPlaying={isPlaying} />
            
            <Galaxy theme={theme} />
            
            <AudioRings theme={theme} isPlaying={isPlaying} />

            <MusicCore 
              imageUrl={currentSong?.song_image} 
              isPlaying={isPlaying} 
              theme={theme}
            />

            <OrbitingAvatars members={members} />
            
            {/* Phase 1 Post-Processing: Targeted Bloom & Vignette */}
            <EffectComposer>
              <Bloom 
                luminanceThreshold={0.8} // Only very bright (emissive) things bloom
                mipmapBlur 
                luminanceSmoothing={0.1} 
                intensity={0.4} 
              />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
            
            <Preload all />
          </Suspense>
        </PerformanceManager>
      </Canvas>
    </div>
  );
};
