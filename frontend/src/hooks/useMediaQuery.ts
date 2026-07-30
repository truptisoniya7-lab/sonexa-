import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQueryList = window.matchMedia(query);
      const documentChangeHandler = (e: MediaQueryListEvent) => setMatches(e.matches);

      // Set initial value
      setMatches(mediaQueryList.matches);

      // Add listener
      mediaQueryList.addEventListener('change', documentChangeHandler);

      // Clean up
      return () => {
        mediaQueryList.removeEventListener('change', documentChangeHandler);
      };
    }
  }, [query]);

  return matches;
}
