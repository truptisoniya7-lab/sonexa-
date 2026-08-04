import React from 'react';
import { motion, Reorder } from 'framer-motion';
import { Play, Music, GripVertical, Trash2, Sparkles } from 'lucide-react';
import { PlayerSong } from '../../services/PlayerService';
import { usePlayer } from '../../context/PlayerContext';
import { Switch } from '@/components/ui/switch';

interface QueuePanelProps {
  queue: PlayerSong[];
  currentSongIndex: number;
  onPlaySong: (index: number) => void;
  onRemove: (index: number) => void;
  onReorder: (newQueue: PlayerSong[]) => void;
}

export function QueuePanel({ queue, currentSongIndex, onPlaySong, onRemove, onReorder }: QueuePanelProps) {
  const { isAutoplayEnabled, setIsAutoplayEnabled } = usePlayer();

  const handleReorder = (items: PlayerSong[], sectionQueue: PlayerSong[], sectionOffset: number) => {
    // We only reorder within the specific section (e.g., manual section or auto section)
    // To do this simply, we reconstruct the whole queue
    const prefix = queue.slice(0, sectionOffset);
    const suffix = queue.slice(sectionOffset + sectionQueue.length);
    const newQueue = [...prefix, ...items, ...suffix];
    onReorder(newQueue);
  };

  const renderSong = (song: PlayerSong, index: number, isPlaying: boolean, showReason = false) => {
    return (
      <div 
        className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isPlaying ? 'bg-primary/20' : 'hover:bg-white/10'}`}
        onClick={() => !isPlaying && onPlaySong(index)}
      >
        <div className="w-6 flex justify-center shrink-0">
          {isPlaying ? (
            <div className="flex items-end justify-center gap-[2px] h-3.5 w-4 overflow-hidden">
              <motion.div animate={{ height: ["40%", "100%", "40%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} className="w-1 bg-primary rounded-t-sm" />
              <motion.div animate={{ height: ["100%", "30%", "100%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-1 bg-primary rounded-t-sm" />
              <motion.div animate={{ height: ["60%", "90%", "60%"] }} transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} className="w-1 bg-primary rounded-t-sm" />
            </div>
          ) : (
            <span className="text-xs font-medium text-muted-foreground group-hover:hidden">{index + 1}</span>
          )}
          {!isPlaying && <Play className="w-4 h-4 text-foreground fill-current hidden group-hover:block" />}
        </div>
        
        <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 bg-black/50">
          {song.song_image ? (
            <img src={song.song_image} alt="Art" className="w-full h-full object-cover" />
          ) : (
            <Music className="w-full h-full p-2 text-muted-foreground/50" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className={`text-sm font-medium truncate leading-tight ${isPlaying ? 'text-primary' : 'text-white group-hover:text-primary'}`}>
            {song.song_title}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-muted-foreground truncate leading-tight">
              {song.song_artist}
            </p>
            {showReason && song.matchScore && (
              <span className="text-[10px] text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded font-medium">
                {song.matchScore}% Match
              </span>
            )}
          </div>
        </div>

        {!isPlaying && (
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(index); }}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-white transition-colors">
              <GripVertical className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const upcomingQueue = queue.slice(currentSongIndex + 1);
  const manualQueue = upcomingQueue.filter(s => s.queueSource !== 'auto');
  const autoQueue = upcomingQueue.filter(s => s.queueSource === 'auto');

  // The empty state shows if there's nothing playing, or (no manual & no auto & autoplay off)
  const showEmptyState = queue.length === 0 || (upcomingQueue.length === 0 && !isAutoplayEnabled);

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar pb-24 pr-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-white">Queue</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Autoplay</span>
          <Switch checked={isAutoplayEnabled} onCheckedChange={setIsAutoplayEnabled} />
        </div>
      </div>
      
      {showEmptyState ? (
        <div className="flex flex-col items-center justify-center text-muted-foreground py-10">
          <Music className="w-10 h-10 mb-2 opacity-50" />
          <p className="text-sm font-medium">Queue is empty</p>
          {!isAutoplayEnabled && (
            <p className="text-xs mt-2 opacity-70 text-center">Turn on Autoplay to get endless recommendations.</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* NOW PLAYING */}
          {queue[currentSongIndex] && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Now Playing</h4>
              {renderSong(queue[currentSongIndex], currentSongIndex, true)}
            </div>
          )}
          
          {/* ADDED BY YOU */}
          {manualQueue.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Added by You</h4>
              <Reorder.Group axis="y" values={manualQueue} onReorder={(items) => handleReorder(items, manualQueue, currentSongIndex + 1)}>
                {manualQueue.map((song, idx) => {
                  // We need the actual global index for the play/remove handlers
                  const actualIndex = currentSongIndex + 1 + idx;
                  return (
                    <Reorder.Item key={`${song.song_uri}-${actualIndex}-manual`} value={song}>
                      {renderSong(song, actualIndex, false)}
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            </div>
          )}

          {/* RECOMMENDED / AUTOPLAY */}
          {autoQueue.length > 0 && (
            <div>
              <div className="flex flex-col mb-3 px-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  Recommended
                </h4>
                {queue[currentSongIndex] && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] text-muted-foreground">
                      Based on: <strong className="text-white/70">{queue[currentSongIndex].song_title}</strong>
                    </span>
                  </div>
                )}
              </div>

              <Reorder.Group axis="y" values={autoQueue} onReorder={(items) => handleReorder(items, autoQueue, currentSongIndex + 1 + manualQueue.length)}>
                {autoQueue.map((song, idx) => {
                  const actualIndex = currentSongIndex + 1 + manualQueue.length + idx;
                  return (
                    <Reorder.Item key={`${song.song_uri}-${actualIndex}-auto`} value={song}>
                      {renderSong(song, actualIndex, false, true)}
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
