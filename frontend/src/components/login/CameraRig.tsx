'use client';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function CameraRig() {
  const { camera, mouse } = useThree();

  useFrame((state) => {
    // Cinematic breathing
    const t = state.clock.getElapsedTime();
    const breathingX = Math.sin(t * 0.2) * 0.5;
    const breathingY = Math.cos(t * 0.2) * 0.5;
    const breathingZ = Math.sin(t * 0.1) * 0.5;

    // Mouse tilt
    const targetX = (mouse.x * 2) + breathingX;
    const targetY = (mouse.y * 2) + breathingY;

    // Smooth dampening
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.02);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.02);
    camera.position.z = 15 + breathingZ;

    camera.lookAt(0, 0, 0);
  });

  return null;
}
