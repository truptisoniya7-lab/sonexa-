'use client';

import { useEffect, useRef } from 'react';

export function Aurora() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      time += 0.005;
      
      // Get CSS variable for dominant color
      const dominantRgb = getComputedStyle(document.documentElement).getPropertyValue('--dominant-color').trim() || '139, 92, 246';
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create a smooth shifting gradient blob effect - deeply tinted and rich
      const cx = canvas.width / 2 + Math.sin(time) * canvas.width * 0.2;
      const cy = canvas.height / 2 + Math.cos(time * 0.8) * canvas.height * 0.2;
      
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * 0.6);
      gradient.addColorStop(0, `rgba(${dominantRgb}, 0.08)`);
      gradient.addColorStop(0.5, `rgba(${dominantRgb}, 0.03)`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const cx2 = canvas.width * 0.8 + Math.cos(time * 1.2) * canvas.width * 0.3;
      const cy2 = canvas.height * 0.2 + Math.sin(time * 0.5) * canvas.height * 0.3;
      
      const gradient2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, canvas.width * 0.5);
      gradient2.addColorStop(0, `rgba(${dominantRgb}, 0.06)`);
      gradient2.addColorStop(0.5, `rgba(${dominantRgb}, 0.02)`);
      gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-2] pointer-events-none transition-dominant duration-700" 
      style={{ filter: 'blur(60px)' }}
    />
  );
}
