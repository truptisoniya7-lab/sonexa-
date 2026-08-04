import { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

export function usePlayerShortcuts(
  isExpanded: boolean,
  setIsExpanded: (expanded: boolean) => void,
  onLike?: () => void,
  onQueue?: () => void,
  onPlaylist?: () => void
) {
  const { togglePlay, seekTo, progress, volume, setVolume } = usePlayer();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekTo(Math.max(0, progress - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekTo(progress + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'Escape':
          if (isExpanded) {
            e.preventDefault();
            setIsExpanded(false);
          }
          break;
        case 'KeyL':
          if (onLike) {
            e.preventDefault();
            onLike();
          }
          break;
        case 'KeyQ':
          if (onQueue) {
            e.preventDefault();
            onQueue();
          }
          break;
        case 'KeyP':
          if (onPlaylist) {
            e.preventDefault();
            onPlaylist();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekTo, progress, volume, setVolume, isExpanded, setIsExpanded, onLike, onQueue, onPlaylist]);
}
