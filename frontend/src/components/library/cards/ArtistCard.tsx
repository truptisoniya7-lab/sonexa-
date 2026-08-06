import React from 'react';
import { Play } from 'lucide-react';

interface ArtistCardProps {
  artist: any;
  onClick?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick }) => {
  return (
    <div onClick={onClick} className="group flex flex-col items-center p-4 cursor-pointer">
      <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden mb-4 shadow-xl border-4 border-transparent group-hover:border-primary/30 transition-all duration-500 group-hover:shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)]">
        <img 
          src={artist.image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167'} 
          alt={artist.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
           <Play className="w-12 h-12 text-white fill-white shadow-2xl drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
        </div>
      </div>
      <h3 className="font-bold text-white text-[18px] text-center mb-1 group-hover:text-primary transition-colors">{artist.title}</h3>
      <p className="text-[13px] text-white/50 text-center font-medium capitalize">{artist.status || 'Artist'}</p>
    </div>
  );
};
