'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface OrbitingAvatarsProps {
  members: any[];
}

export const OrbitingAvatars: React.FC<OrbitingAvatarsProps> = ({ members }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Orbit around the Music Core slowly
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  if (!members || members.length === 0) return null;

  const radius = 3.5; // Orbit radius just outside the Music Core

  return (
    <group ref={groupRef}>
      {members.map((member, i) => {
        const angle = (i / members.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <group key={member.id || i} position={[x, Math.sin(i + angle) * 0.5, z]}>
            {/* transform={false} projects the 3D position to 2D screen coordinates, solving WebGL z-index jank */}
            <Html transform={false} center zIndexRange={[100, 0]}>
              <div 
                className={`relative w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                  member.isSpeaking 
                    ? 'border-green-500 scale-125 shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                    : 'border-white/20 scale-100 hover:scale-110 hover:border-white/50'
                }`}
                style={{
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
              >
                <img 
                  src={member.avatar || `https://i.pravatar.cc/150?u=${member.id}`} 
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover"
                />
                
                {/* Floating name tag */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-white font-bold opacity-0 hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                  {member.name}
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
