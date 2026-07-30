'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Box, Sphere, Torus, Octahedron, Center, Text3D } from '@react-three/drei';
import * as THREE from 'three';
import { PerformanceTier } from './PerformanceManager';

export function FloatingObjects({ tier }: { tier: PerformanceTier }) {
  if (tier === 'mobile') return null;

  return (
    <>
      <Float speed={2} rotationIntensity={1} floatIntensity={2} position={[-5, 2, -2]}>
        <Octahedron args={[1.5, 0]}>
          <meshPhysicalMaterial 
            color="#7C3AED" 
            metalness={0.9} 
            roughness={0.1} 
            transmission={0.9} 
            thickness={0.5} 
            envMapIntensity={2} 
            clearcoat={1}
          />
        </Octahedron>
      </Float>

      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5} position={[4, -2, -3]}>
        <Torus args={[1.2, 0.4, 16, 100]}>
          <meshPhysicalMaterial 
            color="#3B82F6" 
            metalness={0.8} 
            roughness={0.2} 
            emissive="#3B82F6" 
            emissiveIntensity={0.5}
            clearcoat={1}
          />
        </Torus>
      </Float>
      
      <Float speed={3} rotationIntensity={0.5} floatIntensity={3} position={[-3, -3, 1]}>
        <Sphere args={[0.8, 32, 32]}>
          <meshStandardMaterial 
            color="#C084FC" 
            emissive="#A855F7" 
            emissiveIntensity={2} 
            roughness={0.2} 
            metalness={0.8}
          />
        </Sphere>
      </Float>

      {tier === 'high' && (
        <Float speed={1} rotationIntensity={1.5} floatIntensity={1} position={[6, 3, -5]}>
          <Box args={[2, 2, 2]}>
            <meshPhysicalMaterial 
              color="#ffffff" 
              transmission={1} 
              opacity={1} 
              metalness={0} 
              roughness={0} 
              ior={1.5} 
              thickness={2} 
            />
          </Box>
        </Float>
      )}
    </>
  );
}
