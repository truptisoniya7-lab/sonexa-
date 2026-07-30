'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Mock audio visualizer that drives scene energy
export function AudioVisualizer() {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ringsRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Simulate audio reactivity (pulse)
    const energy = 1 + Math.sin(t * 8) * 0.05 + Math.sin(t * 2) * 0.1;
    
    ringsRef.current.scale.set(energy, energy, energy);
    ringsRef.current.rotation.z = t * 0.2;
    ringsRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
  });

  return (
    <group ref={ringsRef} position={[0, 0, -10]}>
      {/* Outer energy ring */}
      <mesh>
        <torusGeometry args={[12, 0.05, 16, 100]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* Inner energy ring */}
      <mesh>
        <torusGeometry args={[10, 0.02, 16, 100]} />
        <meshBasicMaterial color="#3B82F6" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}
