import { useState, useEffect, useRef } from 'react';

export const useAudioVisualizer = (isPlaying: boolean) => {
  const [data, setData] = useState({ bass: 0, mid: 0, treble: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      setData({ bass: 0, mid: 0, treble: 0 });
      return;
    }

    let animationFrame: number;
    const updateLoop = () => {
      timeRef.current += 0.05;
      const t = timeRef.current;
      
      const bass = Math.pow(Math.sin(t * Math.PI * 2), 4);
      const mid = (Math.sin(t * 3.4) + Math.cos(t * 7.1)) * 0.5 + 0.5;
      const treble = Math.random() > 0.8 ? Math.random() : 0.2;

      setData({ bass, mid, treble });
      animationFrame = requestAnimationFrame(updateLoop);
    };

    updateLoop();

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  return data;
};
