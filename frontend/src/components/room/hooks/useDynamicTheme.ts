import { useState, useEffect } from 'react';
import { FastAverageColor } from 'fast-average-color';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
  highlight: string;
  glow: string;
  isDark: boolean;
}

const defaultTheme: ThemeColors = {
  primary: '#3b82f6', // blue-500
  secondary: '#8b5cf6', // violet-500
  accent: '#ec4899', // pink-500
  dark: '#0f172a', // slate-900
  light: '#f8fafc', // slate-50
  highlight: '#ffffff',
  glow: 'rgba(59, 130, 246, 0.5)',
  isDark: true,
};

// Helper to convert hex to HSL
const hexToHSL = (hex: string) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

// Helper to convert HSL to Hex
const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#\${f(0)}\${f(8)}\${f(4)}`;
};

export const useDynamicTheme = (imageUrl: string | undefined | null) => {
  const [theme, setTheme] = useState<ThemeColors>(defaultTheme);

  useEffect(() => {
    if (!imageUrl) {
      setTheme(defaultTheme);
      return;
    }

    let isMounted = true;
    const fac = new FastAverageColor();

    fac.getColorAsync(imageUrl, { algorithm: 'dominant', crossOrigin: 'anonymous' })
      .then(color => {
        if (!isMounted) return;

        const baseHsl = hexToHSL(color.hex);
        
        // Generate palette based on dominant color
        const primary = hslToHex(baseHsl.h, Math.max(baseHsl.s, 40), 50);
        const secondary = hslToHex((baseHsl.h + 30) % 360, Math.max(baseHsl.s, 50), 45);
        const accent = hslToHex((baseHsl.h + 150) % 360, Math.max(baseHsl.s, 60), 60);
        const dark = hslToHex(baseHsl.h, Math.min(baseHsl.s, 20), 8); 
        const light = hslToHex(baseHsl.h, Math.min(baseHsl.s, 10), 90);
        const highlight = hslToHex(baseHsl.h, Math.max(baseHsl.s, 80), 85);

        const rgb = color.value;
        const glow = `rgba(\${rgb[0]}, \${rgb[1]}, \${rgb[2]}, 0.5)`;

        setTheme({
          primary,
          secondary,
          accent,
          dark,
          light,
          highlight,
          glow,
          isDark: color.isDark
        });

        // Inject CSS variables into the document for global UI styling
        document.documentElement.style.setProperty('--room-primary', primary);
        document.documentElement.style.setProperty('--room-secondary', secondary);
        document.documentElement.style.setProperty('--room-accent', accent);
        document.documentElement.style.setProperty('--room-dark', dark);
        document.documentElement.style.setProperty('--room-light', light);
        document.documentElement.style.setProperty('--room-highlight', highlight);
        document.documentElement.style.setProperty('--room-glow', glow);
        
      })
      .catch(e => {
        console.error('Failed to extract theme color', e);
        if (isMounted) setTheme(defaultTheme);
      });

    return () => {
      isMounted = false;
      fac.destroy();
    };
  }, [imageUrl]);

  return theme;
};
