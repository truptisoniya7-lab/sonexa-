import React from 'react';
import { Play } from 'lucide-react';

interface PlaylistCardProps {
  playlist: any;
  onClick?: () => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  return (
    <div onClick={onClick} className="group flex flex-col p-4 rounded-3xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all duration-500 cursor-pointer hover:-translate-y-2">
      <div className="relative aspect-square w-full mb-4">
        {/* Fake Stacked Vinyl Effect */}
        <div className="absolute inset-0 rounded-2xl bg-white/5 transform group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:rotate-3 transition-transform duration-500 border border-white/10" />
        <div className="absolute inset-0 rounded-2xl bg-white/10 transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-1 transition-transform duration-500 border border-white/10" />
        
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-white/10 z-10 group-hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.5)] transition-shadow">
          <img 
            src={playlist.image || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc'} 
            alt={playlist.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.5)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-5 h-5 ml-1 fill-white" />
            </div>
          </div>
        </div>
      </div>
      <h3 className="font-bold text-white text-[16px] truncate mb-1">{playlist.title}</h3>
      <p className="text-[13px] text-white/50 truncate font-medium">{playlist.count || '0 Songs'}</p>
    </div>
  );
};
