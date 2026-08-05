'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AudioRingsProps {
  theme: any;
  isPlaying: boolean;
}

export const AudioRings: React.FC<AudioRingsProps> = ({ theme, isPlaying }) => {
  const ringsRef = useRef<THREE.Group>(null);
  
  const ringCount = 3;
  const materials = useMemo(() => {
    return [
      new THREE.MeshStandardMaterial({ color: theme.primary, emissive: theme.primary, emissiveIntensity: 2.0, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ color: theme.secondary, emissive: theme.secondary, emissiveIntensity: 1.5, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ color: theme.accent, emissive: theme.accent, emissiveIntensity: 1.0, transparent: true, opacity: 0.4, side: THREE.DoubleSide }),
    ];
  }, [theme]);

  useFrame((state, delta) => {
    if (!ringsRef.current) return;
    
    // Rotate rings slowly
    ringsRef.current.children.forEach((ring, i) => {
      ring.rotation.z += delta * (0.2 + i * 0.1);
      ring.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.1;
      ring.rotation.y = Math.cos(state.clock.elapsedTime * 0.3 + i) * 0.1;

      // Audio reactivity simulation
      if (isPlaying) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 8 + i * Math.PI) * 0.05;
        ring.scale.set(scale, scale, scale);
      } else {
        ring.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    });
  });

  return (
    <group ref={ringsRef} position={[0, 0, 0]}>
      {materials.map((mat, i) => (
        <mesh key={i} material={mat}>
          <ringGeometry args={[2.5 + i * 0.3, 2.52 + i * 0.3, 64]} />
        </mesh>
      ))}
    </group>
  );
};
