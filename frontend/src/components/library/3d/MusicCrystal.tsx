'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=300';

interface MusicCrystalProps {
  imageUrl?: string;
  theme: any;
}

export const MusicCrystal: React.FC<MusicCrystalProps> = ({ imageUrl, theme }) => {
  const crystalRef = useRef<THREE.Group>(null);
  const outerCrystalRef = useRef<THREE.Mesh>(null);
  const innerEnergyRef = useRef<THREE.Mesh>(null);
  const vinylRef = useRef<THREE.Mesh>(null);
  const audioRingRef = useRef<THREE.Mesh>(null);
  
  const texture = useTexture(imageUrl || DEFAULT_COVER);

  const basePositions = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2, 4);
    return geo.attributes.position.clone();
  }, []);

  useFrame((state, delta) => {
    if (!crystalRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Slow elegant rotation of the entire group
    crystalRef.current.rotation.y += delta * 0.1;
    crystalRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    crystalRef.current.rotation.z = Math.cos(time * 0.2) * 0.05;

    // Outer crystal subtle breathing distortion
    if (outerCrystalRef.current) {
      const positions = outerCrystalRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const count = positions.count;
      for (let i = 0; i < count; i++) {
        const u = basePositions.getX(i);
        const v = basePositions.getY(i);
        const w = basePositions.getZ(i);
        const distortion = Math.sin(u * 2 + time * 0.5) * 0.02 + Math.cos(v * 2 + time * 0.4) * 0.02;
        const scale = 1 + distortion;
        positions.setXYZ(i, u * scale, v * scale, w * scale);
      }
      positions.needsUpdate = true;
      outerCrystalRef.current.geometry.computeVertexNormals();
    }

    // Inner Energy pulse
    if (innerEnergyRef.current) {
      innerEnergyRef.current.rotation.y -= delta * 0.2;
      const scale = 1 + Math.sin(time * 2) * 0.03;
      innerEnergyRef.current.scale.set(scale, scale, scale);
    }

    // Vinyl spin
    if (vinylRef.current) {
      vinylRef.current.rotation.y -= delta * 0.5;
    }

    // Audio Ring glow pulse
    if (audioRingRef.current) {
      audioRingRef.current.rotation.x += delta * 0.1;
      audioRingRef.current.rotation.y -= delta * 0.1;
      const scale = 1 + Math.sin(time * 3) * 0.05;
      audioRingRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={crystalRef} scale={1.2}>
      
      {/* 1. Outer Crystal Glass */}
      <mesh ref={outerCrystalRef}>
        <icosahedronGeometry args={[2, 4]} />
        <MeshTransmissionMaterial 
          backside
          thickness={1.5}
          roughness={0.1}
          transmission={0.95}
          ior={1.4}
          chromaticAberration={0.05}
          color={theme.isDark ? '#111' : '#fff'}
          distortion={0.3}
          distortionScale={0.2}
          temporalDistortion={0.1}
        />
      </mesh>

      {/* 2. Inner Animated Energy */}
      <mesh ref={innerEnergyRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color={theme.primary} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* 3. Album Artwork Plate */}
      <mesh position={[0, 0, 0.2]}>
        <planeGeometry args={[1.8, 1.8]} />
        <meshStandardMaterial map={texture} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* 4. Rear Energy Layer (Backlight for album) */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color={theme.secondary} transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* 5. Rotating Vinyl */}
      <mesh ref={vinylRef} position={[0, 0, -0.3]}>
        <cylinderGeometry args={[1.2, 1.2, 0.02, 64]} />
        <meshStandardMaterial color="#050505" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* 6. Audio Glowing Ring */}
      <mesh ref={audioRingRef}>
        <ringGeometry args={[2.3, 2.32, 64]} />
        <meshBasicMaterial color={theme.accent} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* 7. Floating Particles orbiting the crystal */}
      <group>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={i} position={[
            Math.sin(i) * (2.5 + Math.random()), 
            Math.cos(i * 1.5) * (2.5 + Math.random()), 
            Math.sin(i * 0.5) * (2.5 + Math.random())
          ]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={theme.primary} transparent opacity={0.5} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
      
    </group>
  );
};
