'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CinematicCameraProps {
  currentSong: any;
  isPlaying: boolean;
}

export const CinematicCamera: React.FC<CinematicCameraProps> = ({ currentSong, isPlaying }) => {
  const mouse = useRef(new THREE.Vector2());
  const transitionTime = useRef(0);
  const isTransitioning = useRef(false);
  const baseAngle = useRef(0);

  useEffect(() => {
    if (currentSong) {
      isTransitioning.current = true;
      transitionTime.current = 0;
    }
  }, [currentSong?.song_uri]);

  useFrame((state, delta) => {
    // 1. Idle breathing & Audio Pulse
    const time = state.clock.elapsedTime;
    const breatheZoom = Math.sin(time * 0.5) * 0.1;
    const pulseZoom = isPlaying ? Math.sin(time * 8) * 0.05 : 0; // Simulated bass pulse

    // 2. Mouse Parallax target
    mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, state.pointer.x, 0.1);
    mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, state.pointer.y, 0.1);

    // 3. Song Transition Sweep
    if (isTransitioning.current) {
      transitionTime.current += delta;
      const progress = Math.min(transitionTime.current / 1.5, 1);
      // Easing function (easeOutExpo)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      baseAngle.current = THREE.MathUtils.lerp(baseAngle.current, Math.PI * 2, ease * 0.05);
      
      if (progress >= 1) {
        isTransitioning.current = false;
      }
    } else {
      baseAngle.current = 0;
    }

    // Calculate target position
    const radius = 8 + breatheZoom - pulseZoom;
    const targetX = mouse.current.x * 2 + Math.sin(baseAngle.current) * 5;
    const targetY = mouse.current.y * 2;
    const targetZ = Math.cos(baseAngle.current) * radius;

    // Smoothly damp camera position
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 2, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 2, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 2, delta);

    // Look slightly off-center based on mouse to emphasize parallax
    state.camera.lookAt(targetX * 0.1, targetY * 0.1, 0);
  });

  return null;
};
