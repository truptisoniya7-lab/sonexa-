import React from 'react';
import { PlayerSong } from '../../../services/PlayerService';
import { User, Music2, Edit3, Disc, Calendar, Info } from 'lucide-react';

interface CreditsPanelProps {
  song: PlayerSong;
}

export function CreditsPanel({ song }: CreditsPanelProps) {
  // Mock data for credits since it might not be fully available in PlayerSong
  const credits = [
    { label: 'Artist', value: song.song_artist, icon: User },
    { label: 'Producer', value: 'AP Dhillon (Mock)', icon: Music2 },
    { label: 'Composer', value: 'Shinda Kahlon (Mock)', icon: Edit3 },
    { label: 'Label', value: 'Run-Up Records (Mock)', icon: Disc },
    { label: 'Released', value: '2023', icon: Calendar },
  ];

  return (
    <div className="w-full flex flex-col h-full overflow-hidden px-4">
      <div className="flex items-center gap-2 mb-6 text-white">
        <Info className="w-5 h-5 text-white/50" />
        <h3 className="font-bold text-xl">Credits</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-24">
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-2">
            <h4 className="text-sm font-medium text-white/50 mb-1">Song</h4>
            <p className="text-lg font-bold text-white truncate">{song.song_title}</p>
          </div>
          
          {credits.map((credit, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <credit.icon className="w-5 h-5 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-0.5">{credit.label}</h4>
                <p className="text-[15px] font-semibold text-white truncate">{credit.value}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center text-xs text-white/30">
          <p>Source: Provided by the Label</p>
        </div>
      </div>
    </div>
  );
}
