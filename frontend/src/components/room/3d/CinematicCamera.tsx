'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const CinematicCamera: React.FC = () => {
  const mouse = useRef(new THREE.Vector2());

  useFrame((state, delta) => {
    // 1. Idle breathing
    const time = state.clock.elapsedTime;
    const breatheZoom = Math.sin(time * 0.5) * 0.1;

    // 2. Mouse Parallax target
    mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, state.pointer.x, 0.1);
    mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, state.pointer.y, 0.1);

    // Calculate target position
    const targetX = mouse.current.x * 2;
    const targetY = mouse.current.y * 2;
    const targetZ = 8 + breatheZoom; // Base distance 8

    // Smoothly damp camera position
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 2, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 2, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 2, delta);

    // Look slightly off-center based on mouse to emphasize parallax
    state.camera.lookAt(targetX * 0.1, targetY * 0.1, 0);
  });

  return null;
};
