import { Play, Pause } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';

export const HistoryCard = ({ item, onPlay }: { item: any, onPlay: () => void }) => {
  const { currentSong, isPlaying } = usePlayer();
  const isCurrent = currentSong?.song_uri === item.uri;
  
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div 
      className="group flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-xl p-3 cursor-pointer transition-all relative overflow-hidden"
      onClick={onPlay}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="relative w-14 h-14 shrink-0 rounded-md overflow-hidden">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isCurrent && isPlaying ? (
            <Pause className="w-6 h-6 text-white fill-white" />
          ) : (
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-bold text-[15px] text-white truncate group-hover:text-primary transition-colors">{item.title}</h3>
        <p className="text-[13px] text-white/50 truncate">{item.artist}</p>
        
        {item.progress > 0 && !item.completed && (
          <div className="w-full max-w-[150px] h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${item.progress}%` }} />
          </div>
        )}
      </div>

      <div className="shrink-0 text-right flex flex-col items-end gap-1">
        <span className="text-[12px] text-white/40">{timeAgo(item.lastPlayed)}</span>
        {item.progress > 0 && !item.completed && (
          <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
            Resume
          </span>
        )}
      </div>
    </div>
  );
};
