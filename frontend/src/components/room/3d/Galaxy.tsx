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
      {/* 1 & 2. Deep Space & Tiny Animated Stars */}
      <Stars radius={60} depth={50} count={particleCount * 3} factor={3} saturation={1} fade speed={1.5} />
      <Stars radius={80} depth={20} count={particleCount} factor={6} saturation={0.5} fade speed={0.5} />
      
      {/* 3 & 4. Volumetric Fog & Nebula Clouds */}
      {enableComplexShaders && (
        <group>
          <Cloud 
            opacity={0.15} 
            speed={0.1} 
            bounds={[25, 10, 25]}
            segments={20} 
            position={[-10, 5, -25]} 
            color={theme.dark} 
          />
          <Cloud 
            opacity={0.15} 
            speed={0.15} 
            bounds={[20, 5, 20]}
            segments={15} 
            position={[10, -5, -20]} 
            color={theme.secondary} 
          />
        </group>
      )}

      {/* 5. Floating Dust / Audio Reactive Particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleCount}
            args={[scales, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color={theme.highlight}
          transparent
          opacity={0.4}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 6. Soft Light Rays / Purple Aurora Simulation */}
      {enableComplexShaders && (
        <mesh position={[0, 10, -30]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[40, 20]} />
          <meshBasicMaterial 
            color={theme.primary} 
            transparent 
            opacity={0.03} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};
