import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';
import { ActivityEvent } from '@/types/room';

interface ActivityFeedProps {
  activities: ActivityEvent[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getEventStyle = (type: ActivityEvent['type']) => {
    switch(type) {
      case 'join': return { color: 'bg-green-500', text: 'joined the room' };
      case 'leave': return { color: 'bg-red-500', text: 'left the room' };
      case 'add_song': return { color: 'bg-blue-500', text: 'added a song to the queue' };
      case 'play_song': return { color: 'bg-primary', text: 'started playing a song' };
      case 'upvote': return { color: 'bg-pink-500', text: 'upvoted a track' };
      case 'voice_join': return { color: 'bg-purple-500', text: 'joined voice chat' };
      default: return { color: 'bg-gray-500', text: 'performed an action' };
    }
  };

  return (
    <div className="bg-black/20 rounded-xl p-4 border border-white/5 transition-all hover:bg-black/30 hover:border-white/10 overflow-hidden flex flex-col min-h-[140px]">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4"/> Room Activity
      </h3>
      <div className="space-y-3 flex-1 overflow-hidden relative">
        <AnimatePresence initial={false}>
          {activities.length === 0 && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-sm text-muted-foreground absolute"
            >
              No recent activity.
            </motion.p>
          )}
          {activities.slice(0, 4).map((activity, index) => {
            const style = getEventStyle(activity.type);
            return (
              <motion.div 
                key={activity.id}
                layout
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 text-sm text-foreground/80 bg-white/5 p-2 rounded-lg border border-white/5"
              >
                <div className={`w-2 h-2 rounded-full \${style.color} animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.2)]`}></div> 
                <span className="font-medium text-white">{activity.user_name}</span> {style.text}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
