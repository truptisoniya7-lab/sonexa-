import React from 'react';
import { PlayerSong } from '../../services/PlayerService';
import { Info, Clock, Play, Tag, Calendar, User, LayoutGrid, MonitorPlay } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

interface SongInfoPanelProps {
  song: PlayerSong;
}

export function SongInfoPanel({ song }: SongInfoPanelProps) {
  const { duration } = usePlayer();

  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <h3 className="font-bold text-lg text-white">About the Track</h3>
      
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="flex flex-col">
          <InfoRow icon={<Clock className="w-4 h-4" />} label="Duration" value={formatDuration(duration)} />
          <InfoRow icon={<Play className="w-4 h-4" />} label="Views" value="---" />
          <InfoRow icon={<Tag className="w-4 h-4" />} label="Genre" value="Various" />
          <InfoRow icon={<Calendar className="w-4 h-4" />} label="Upload Date" value="---" />
          <InfoRow icon={<User className="w-4 h-4" />} label="Channel" value={song.song_artist} />
          <InfoRow icon={<LayoutGrid className="w-4 h-4" />} label="Source" value="YouTube" />
          <InfoRow icon={<MonitorPlay className="w-4 h-4" />} label="Video Quality" value="Audio Only" />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3 text-muted-foreground">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
