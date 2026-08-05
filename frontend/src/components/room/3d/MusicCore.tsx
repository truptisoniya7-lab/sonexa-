'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Environment, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { usePerformance } from '../performance/PerformanceManager';

interface MusicCoreProps {
  imageUrl?: string;
  isPlaying: boolean;
  theme: any;
}

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=500';

export const MusicCore: React.FC<MusicCoreProps> = ({ imageUrl, isPlaying, theme }) => {
  const { enableComplexShaders } = usePerformance();
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const vinylRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.SphereGeometry>(null);
  
  const texture = useTexture(imageUrl || DEFAULT_COVER);
  
  // Store original vertex positions for the organic shader effect
  const basePositions = useMemo(() => {
    const geo = new THREE.SphereGeometry(2.2, 64, 64);
    return geo.attributes.position.clone();
  }, []);

  const artMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.1,
      metalness: 0.2,
      emissive: theme.primary,
      emissiveIntensity: 2.5, // High intensity to pierce the threshold
    });
  }, [texture, theme.primary]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // 1. Core Breathing & Parallax 
    const time = state.clock.elapsedTime;
    
    // 2. Organic Vertex Distortion (Liquid Plasma)
    if (enableComplexShaders && coreRef.current && geometryRef.current) {
      const positions = geometryRef.current.attributes.position;
      const count = positions.count;
      
      for (let i = 0; i < count; i++) {
        const u = basePositions.getX(i);
        const v = basePositions.getY(i);
        const w = basePositions.getZ(i);
        
        // Simulating a noise displacement using sin/cos math
        const distortion = Math.sin(u * 2 + time) * 0.05 + Math.cos(v * 2 + time * 0.8) * 0.05;
        const scale = 1 + distortion;
        
        positions.setXYZ(i, u * scale, v * scale, w * scale);
      }
      positions.needsUpdate = true;
      geometryRef.current.computeVertexNormals();
    } else if (!enableComplexShaders && groupRef.current) {
      // Fallback breathing if shaders are disabled
      const scale = 1 + Math.sin(time) * 0.02;
      groupRef.current.scale.set(scale, scale, scale);
    }

    // 3. Idle rotation
    groupRef.current.rotation.y += delta * 0.1;
    groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;

    // 4. Rotate vinyl
    if (isPlaying && vinylRef.current) {
      vinylRef.current.rotation.z -= delta * 1.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Environment Map for Glass Refraction (Fixes the White Ball issue) */}
      <Environment preset="city" />

      {/* The Liquid Glass Music Core */}
      <mesh ref={coreRef}>
        <sphereGeometry ref={geometryRef} args={[2.2, 64, 64]} />
        {enableComplexShaders ? (
          <MeshTransmissionMaterial 
            backside
            thickness={1}
            roughness={0.05}
            transmission={1}
            ior={1.5}
            chromaticAberration={0.06}
            color={theme.light}
            distortion={0.5}
            distortionScale={0.5}
            temporalDistortion={0.1}
          />
        ) : (
          <meshPhysicalMaterial 
            transmission={0.9} 
            thickness={0.5} 
            roughness={0.1}
            color={theme.light}
          />
        )}
      </mesh>

      {/* Inner Album Art Plate */}
      <mesh material={artMaterial} position={[0, 0, 0]}>
        <planeGeometry args={[2.8, 2.8]} />
      </mesh>
      
      {/* Energy Plasma Layer (Inner glow) */}
      <mesh position={[0, 0, -0.2]}>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshBasicMaterial color={theme.accent} transparent opacity={0.15} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Vinyl Disc behind the album */}
      <mesh ref={vinylRef} position={[0, 0, -0.5]}>
        <cylinderGeometry args={[1.8, 1.8, 0.05, 64]} />
        <meshStandardMaterial color="#111" roughness={0.6} metalness={0.4} />
      </mesh>
      
      {/* Vinyl label (Neon Rim effect) */}
      <mesh position={[0, 0, -0.528]} rotation={[Math.PI / 2, 0, 0]}>
         <cylinderGeometry args={[0.6, 0.6, 0.06, 32]} />
         <meshStandardMaterial color={theme.primary} emissive={theme.primary} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
};
