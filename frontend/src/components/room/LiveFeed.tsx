import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Music, MessageSquare, UserPlus, Flame } from 'lucide-react';

export interface LiveEvent {
  id: string;
  type: 'join' | 'react' | 'chat' | 'song' | 'milestone';
  roomName: string;
  user: string;
  content: string;
  timestamp: number;
}

export const LiveFeed: React.FC<{ events: LiveEvent[] }> = ({ events }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'react': return <Heart className="w-4 h-4 text-red-500" />;
      case 'song': return <Music className="w-4 h-4 text-primary" />;
      case 'chat': return <MessageSquare className="w-4 h-4 text-pink-400" />;
      case 'join': return <UserPlus className="w-4 h-4 text-blue-400" />;
      case 'milestone': return <Flame className="w-4 h-4 text-orange-500" />;
      default: return <MessageSquare className="w-4 h-4 text-white/50" />;
    }
  };

  const getRelativeTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <div className="w-72 hidden xl:flex flex-col h-[calc(100vh-8rem)] sticky top-24 bg-background/40 backdrop-blur-3xl border border-white/5 rounded-3xl p-5 shadow-2xl overflow-hidden shrink-0 ml-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-extrabold text-lg flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          Live Feed
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto hide-scrollbar -mx-2 px-2 relative">
        <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-background/40 to-transparent z-10 pointer-events-none" />
        
        <div className="flex flex-col gap-3 pb-10">
          <AnimatePresence initial={false}>
            {events.map((ev) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, height: 0, x: 20 }}
                animate={{ opacity: 1, height: 'auto', x: 0 }}
                exit={{ opacity: 0, height: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 border border-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 bg-background p-1.5 rounded-md shadow-sm border border-white/5">
                    {getEventIcon(ev.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/90 leading-relaxed">
                      <span className="font-bold text-white">{ev.user}</span>{' '}
                      {ev.content}{' '}
                      <span className="font-medium text-primary">in {ev.roomName}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {getRelativeTime(ev.timestamp)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {events.length === 0 && (
            <p className="text-xs text-center text-muted-foreground mt-10">
              Waiting for live activity...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
