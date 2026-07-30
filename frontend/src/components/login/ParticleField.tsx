'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PerformanceTier } from './PerformanceManager';

export function ParticleField({ tier }: { tier: PerformanceTier }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particleCount = useMemo(() => {
    switch(tier) {
      case 'high': return 500;
      case 'medium': return 200;
      case 'low': return 50;
      default: return 0;
    }
  }, [tier]);

  const [positions, scales] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
      scales[i] = Math.random() * 2;
    }

    return [positions, scales];
  }, [particleCount]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Rotate entire particle system slowly
    pointsRef.current.rotation.y = t * 0.05;
    pointsRef.current.rotation.x = t * 0.02;

    // We can also animate individual particles through a custom shader if needed,
    // but for simplicity and performance, rotating the group is very cheap.
  });

  if (particleCount === 0) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-scale"
          count={particleCount}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#C084FC"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
