'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Users, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

export function FriendsLiveActivity() {
  const queryClient = useQueryClient();

  const { data: friends, isLoading } = useQuery({
    queryKey: ['home', 'friends'],
    queryFn: async () => {
      const res = await fetch('/api/home/friends');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const channel = supabase
      .channel('friends_activity_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'friend_activity' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['home', 'friends'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <div className="space-y-6 sticky top-24">
      <h3 className="text-sm font-bold flex items-center gap-2 text-foreground/80 tracking-wider uppercase">
        <Activity className="w-4 h-4 text-primary" /> Live Activity
      </h3>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Skeleton className="w-12 h-12 rounded-full opacity-50" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-3/4 opacity-50" />
                <Skeleton className="h-2 w-1/2 opacity-50" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {friends?.length > 0 ? friends.map((activity: any, i: number) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="flex items-center gap-3 p-3 rounded-2xl glass hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="relative w-12 h-12 rounded-full bg-primary/20 shrink-0 flex items-center justify-center border border-white/10 overflow-visible group-hover:border-primary/50 transition-colors">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user_id}`} alt="User avatar" className="w-10 h-10 rounded-full" />
                   {/* Online indicator / pulse */}
                   <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                   <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">User {activity.user_id.slice(0,4)}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {/* Animated Equalizer */}
                    {activity.type === 'listening' ? (
                      <div className="flex items-end gap-[2px] h-3">
                        <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-primary rounded-t-sm" />
                        <motion.div animate={{ height: [6, 12, 6] }} transition={{ repeat: Infinity, duration: 0.9, delay: 0.2 }} className="w-1 bg-primary rounded-t-sm" />
                        <motion.div animate={{ height: [3, 8, 3] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.1 }} className="w-1 bg-primary rounded-t-sm" />
                      </div>
                    ) : null}
                    <span className="text-xs text-muted-foreground truncate">
                      {activity.type === 'listening' ? 'Listening now' : 'Liked a track'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )) : (
              <p className="text-sm text-muted-foreground italic text-center py-4">No friends are online right now.</p>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
