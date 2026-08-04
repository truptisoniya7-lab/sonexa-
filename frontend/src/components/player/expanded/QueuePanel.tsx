import React from 'react';
import { PlayerSong } from '../../../services/PlayerService';
import { UpNextCard } from './UpNextCard';
import { RecommendationCard } from './RecommendationCard';
import { Switch } from '@/components/ui/switch';
import { usePlayer } from '../../../context/PlayerContext';
import { Reorder, AnimatePresence } from 'framer-motion';

interface PremiumQueuePanelProps {
  queue: PlayerSong[];
  currentSongIndex: number;
  onPlaySong: (index: number) => void;
  onReorder: (newQueue: PlayerSong[]) => void;
}

export function PremiumQueuePanel({ queue, currentSongIndex, onPlaySong, onReorder }: PremiumQueuePanelProps) {
  const { isAutoplayEnabled, setIsAutoplayEnabled } = usePlayer();

  const upcomingQueue = queue.slice(currentSongIndex + 1);
  const upNextSong = upcomingQueue[0];
  const restOfQueue = upcomingQueue.slice(1);

  const handleReorder = (items: PlayerSong[]) => {
    // Basic reorder handling for the rest of the queue
    // Reconstruct full queue
    if (!upNextSong) return;
    const prefix = queue.slice(0, currentSongIndex + 1);
    onReorder([...prefix, upNextSong, ...items]);
  };

  return (
    <div className="w-full flex flex-col h-full">
      {/* Queue Header */}
      <div className="flex flex-col gap-2 mb-6 px-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white tracking-tight">Queue</h3>
            <div className="flex items-center gap-1.5 text-sm font-medium text-white/50 bg-white/5 px-2.5 py-1 rounded-full">
              <span>{upcomingQueue.length} Songs</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>{Math.round(upcomingQueue.length * 3.2)} Minutes Left</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
              Autoplay {isAutoplayEnabled ? 'ON' : 'OFF'}
            </span>
            <Switch checked={isAutoplayEnabled} onCheckedChange={setIsAutoplayEnabled} />
          </div>
        </div>

        <div className="text-xs text-primary/80 mt-1 font-semibold flex items-center gap-1.5 bg-primary/10 w-fit px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Playing from Smart Queue
        </div>
      </div>

      {/* Queue Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-12 flex flex-col gap-6">
        
        {/* Up Next Card (First Item) */}
        {upNextSong ? (
          <UpNextCard 
            song={upNextSong} 
            onPlay={() => onPlaySong(currentSongIndex + 1)} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white/5 rounded-xl border border-white/5">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <span className="text-xl">✨</span>
            </div>
            <p className="text-sm font-semibold text-white mb-1">Smart Queue will automatically continue playback</p>
            <p className="text-[11px] text-white/50 uppercase tracking-widest font-bold">Autoplay ON</p>
          </div>
        )}

        {/* Rest of the Queue */}
        {restOfQueue.length > 0 && (
          <div className="flex flex-col">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] mb-3 px-2">
              Recommended
            </h4>
            
            <Reorder.Group axis="y" values={restOfQueue} onReorder={handleReorder} className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {restOfQueue.map((song, idx) => {
                  const actualIndex = currentSongIndex + 2 + idx;
                  return (
                    <RecommendationCard 
                      key={`${song.song_uri}-${actualIndex}`} 
                      song={song} 
                      index={actualIndex} 
                      onPlay={() => onPlaySong(actualIndex)} 
                      isDraggable={true}
                    />
                  );
                })}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        )}
      </div>
    </div>
  );
}
