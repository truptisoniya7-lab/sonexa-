'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { usePerformance } from '../performance/PerformanceManager';

interface GalaxyProps {
  theme: any;
}

export const Galaxy: React.FC<GalaxyProps> = ({ theme }) => {
  const { particleCount, enableComplexShaders } = usePerformance();
  const groupRef = useRef<THREE.Group>(null);
  
  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const scl = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
      scl[i] = Math.random() * 0.15;
    }
    return [pos, scl];
  }, [particleCount]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dense background stars */}
      <Stars radius={50} depth={50} count={particleCount * 2} factor={4} saturation={1} fade speed={1} />
      
      {/* Fog/Nebula effect using Drei Cloud */}
      {enableComplexShaders && (
        <Cloud 
          opacity={0.3} 
          speed={0.2} 
          width={20} 
          depth={5} 
          segments={20} 
          position={[0, 0, -15]} 
          color={theme.secondary} 
        />
      )}
      
      {/* Dust Particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleCount}
            array={scales}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color={theme.highlight}
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
