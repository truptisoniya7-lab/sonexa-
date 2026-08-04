import { useState, useEffect } from 'react';
import { FastAverageColor } from 'fast-average-color';

const fac = new FastAverageColor();

export function useDominantColor(imageUrl: string | undefined, defaultColor: string = 'hsl(var(--primary))') {
  const [color, setColor] = useState<string>(defaultColor);
  const [isLight, setIsLight] = useState<boolean>(false);

  useEffect(() => {
    if (!imageUrl) {
      setColor(defaultColor);
      return;
    }

    fac.getColorAsync(imageUrl, { crossOrigin: 'anonymous' })
      .then(result => {
        setColor(result.hex);
        setIsLight(result.isLight);
      })
      .catch(e => {
        console.warn('Failed to extract dominant color:', e);
        setColor(defaultColor);
      });
  }, [imageUrl, defaultColor]);

  return { color, isLight };
}
