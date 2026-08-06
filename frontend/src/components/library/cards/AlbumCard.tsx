import React from 'react';
import { Play } from 'lucide-react';

interface AlbumCardProps {
  album: any;
  onClick?: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick }) => {
  return (
    <div onClick={onClick} className="group flex flex-col p-4 rounded-3xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
      <div className="relative aspect-square w-full mb-4 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-shadow duration-500">
        <img 
          src={album.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'} 
          alt={album.title} 
          className="w-full h-full object-cover group-hover:scale-105 group-hover:blur-[2px] transition-all duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-xl text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 border border-white/20">
            <Play className="w-6 h-6 ml-1 fill-white" />
          </div>
        </div>
      </div>
      <h3 className="font-bold text-white text-[16px] truncate mb-1">{album.title}</h3>
      <p className="text-[13px] text-white/50 truncate font-medium">{album.artist || 'Various Artists'}</p>
    </div>
  );
};
