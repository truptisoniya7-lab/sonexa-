'use client';
import { usePerformanceTier } from './PerformanceManager';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { CameraRig } from './CameraRig';
import { Lighting } from './Lighting';
import { FloatingObjects } from './FloatingObjects';
import { ParticleField } from './ParticleField';
import { AudioVisualizer } from './AudioVisualizer';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

export function LoginScene() {
  const tier = usePerformanceTier();

  if (tier === 'mobile' || tier === 'low') {
    return null; // Fallback to CSS gradient
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} dpr={[1, tier === 'high' ? 2 : 1.5]} gl={{ antialias: false }}>
        <Suspense fallback={null}>
          <Lighting tier={tier} />
          <CameraRig />
          
          <FloatingObjects tier={tier} />
          <ParticleField tier={tier} />
          <AudioVisualizer />
          
          {tier === 'high' && (
            <EffectComposer>
              <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
