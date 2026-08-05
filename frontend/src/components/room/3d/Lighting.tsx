'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LightingProps {
  theme: any;
  isPlaying: boolean;
}

export const Lighting: React.FC<LightingProps> = ({ theme, isPlaying }) => {
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (isPlaying && pointLightRef.current) {
      // Audio reactive placeholder (pulse)
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      pointLightRef.current.intensity = 5 * pulse;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} color={theme.dark} />
      
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={2} 
        color={theme.primary} 
      />
      
      <spotLight
        ref={spotLightRef}
        position={[-5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={3}
        color={theme.secondary}
        castShadow
      />

      <pointLight 
        ref={pointLightRef}
        position={[0, 0, 0]} 
        distance={10}
        intensity={2} 
        color={theme.accent} 
      />
    </>
  );
};
