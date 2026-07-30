import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Mic, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface RoomCardProps {
  id: string | number;
  name: string;
  genre: string;
  listeners: number;
  chatting: number;
  isVoiceActive: boolean;
  nowPlaying: {
    title: string;
    artist: string;
    image: string;
    progress: number;
    duration: number;
  };
  host: string;
  recentActivity: string;
  isTrending?: boolean;
}

export const RoomCard: React.FC<{ room: RoomCardProps }> = ({ room }) => {
  const router = useRouter();

  // Pseudo-random avatars based on room id
  const avatars = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.id}1`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.id}2`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.id}3`,
  ];

  const formatTime = (seconds: number) => {
    const m = Math.floor((seconds || 0) / 60);
    const s = Math.floor((seconds || 0) % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = room.nowPlaying.duration > 0 
    ? (room.nowPlaying.progress / room.nowPlaying.duration) * 100 
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="h-full relative group cursor-pointer"
      onClick={() => router.push(`/room/${room.id}`)}
    >
      {/* Blurred Album Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-60 transition-opacity duration-500 rounded-3xl blur-2xl z-0" 
        style={{ backgroundImage: `url(${room.nowPlaying.image})` }} 
      />

      <div className="h-full relative z-10 bg-background/60 backdrop-blur-3xl border border-white/5 group-hover:border-primary/50 group-hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.4)] group-hover:-translate-y-2 overflow-hidden flex flex-col transition-all duration-300 rounded-3xl p-5">
        
        {room.isTrending && (
          <div className="absolute top-0 right-8 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-lg flex items-center gap-1 z-20">
            🔥 Trending
          </div>
        )}

        {/* Top: Large Album Art & Title */}
        <div className="flex gap-4 mb-4">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg group-hover:shadow-primary/30 transition-shadow">
            <img 
              src={room.nowPlaying.image} 
              alt={room.nowPlaying.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-black text-xl truncate text-white">{room.name}</h3>
            <p className="text-sm font-semibold text-primary truncate">{room.nowPlaying.title}</p>
            <p className="text-xs text-muted-foreground truncate">{room.nowPlaying.artist}</p>
          </div>
        </div>

        {/* Middle: Live Waveform & Progress */}
        <div className="bg-black/30 rounded-xl p-3 mb-4 border border-white/5 relative overflow-hidden">
           {/* Animated Waveform Background */}
           <div className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity flex items-end justify-between px-2 pb-1 gap-1">
             {Array.from({ length: 15 }).map((_, i) => (
               <motion.div 
                 key={i} 
                 className="w-full bg-primary rounded-t-sm origin-bottom" 
                 animate={{ height: ['20%', '80%', '40%', '100%', '30%'] }}
                 transition={{ repeat: Infinity, duration: 1.5 + Math.random(), ease: "easeInOut" }}
               />
             ))}
           </div>
           
           <div className="relative z-10">
             <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-green-500/30">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  LIVE
                </div>
                <div className="text-[10px] text-white/50 font-mono">
                  {formatTime(room.nowPlaying.progress)} / {formatTime(room.nowPlaying.duration)}
                </div>
             </div>
             
             {/* Progress Bar */}
             <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full relative" style={{ width: `${progressPercent}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/50 animate-[shimmer_2s_infinite]" />
                </div>
             </div>
           </div>
        </div>

        {/* Avatars & Stats */}
        <div className="flex items-center justify-between mb-4 mt-auto">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {avatars.map((avatar, i) => (
                <img key={i} src={avatar} alt="listener" className="w-7 h-7 rounded-full border-2 border-background z-10" style={{ zIndex: 3 - i }} />
              ))}
            </div>
            <span className="text-xs font-bold text-white/80 ml-2">+{room.listeners} listening</span>
          </div>
          
          <div className="flex items-center gap-2">
             {room.isVoiceActive && (
               <div className="bg-white/10 p-1.5 rounded-full relative group/host">
                 <Mic className="w-3.5 h-3.5 text-white" />
                 {/* Host glowing animation */}
                 <div className="absolute -inset-1 bg-white/20 rounded-full animate-ping opacity-0 group-hover/host:opacity-100" />
               </div>
             )}
          </div>
        </div>

        {/* Activity Preview & Action */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="text-xs font-medium text-white/70 flex-1 truncate bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
            <MessageSquare className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">{room.recentActivity || "No recent activity"}</span>
          </div>
          
          <Button 
            className="rounded-xl shadow-lg font-bold px-4 bg-white text-black hover:bg-white/90 group-hover:scale-105 transition-transform shrink-0 h-8"
            onClick={(e) => { e.stopPropagation(); router.push(`/room/${room.id}`); }}
          >
            Join Live &rarr;
          </Button>
        </div>

      </div>
    </motion.div>
  );
};
