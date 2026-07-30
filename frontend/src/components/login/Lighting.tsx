'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PerformanceTier } from './PerformanceManager';

export function Lighting({ tier }: { tier: PerformanceTier }) {
  const purpleLightRef = useRef<THREE.PointLight>(null);
  const blueLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (purpleLightRef.current) {
      purpleLightRef.current.position.x = Math.sin(t * 0.5) * 10;
      purpleLightRef.current.position.y = Math.cos(t * 0.3) * 10;
      purpleLightRef.current.intensity = 10 + Math.sin(t * 2) * 2;
    }
    if (blueLightRef.current) {
      blueLightRef.current.position.x = Math.cos(t * 0.4) * 8;
      blueLightRef.current.position.y = Math.sin(t * 0.6) * 8;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} color="#12071C" />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#A855F7" />
      
      {/* Moving Purple Light */}
      <pointLight ref={purpleLightRef} position={[0, 0, 0]} intensity={15} color="#7C3AED" distance={20} decay={2} />
      
      {/* Rim Blue Light */}
      <pointLight ref={blueLightRef} position={[-5, 5, -5]} intensity={10} color="#3B82F6" distance={20} decay={2} />

      {tier === 'high' && (
        <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={2} color="#C084FC" castShadow />
      )}
      
      {/* Volumetric Fog emulation via scene background (handled by Canvas styles mostly) */}
      <fog attach="fog" args={['#050505', 10, 30]} />
    </>
  );
}
