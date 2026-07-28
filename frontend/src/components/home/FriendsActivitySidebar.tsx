'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Activity, Music, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function FriendsActivitySidebar() {
  const router = useRouter();
  
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friendsActivity'],
    queryFn: async () => {
      // Assuming userId 1 for now, this would normally come from an auth context
      const res = await fetch('/api/friends/1');
      if (!res.ok) throw new Error('Failed to fetch friends');
      return res.json();
    },
    // Refetch every 30 seconds to simulate real-time updates
    refetchInterval: 30000, 
  });

  return (
    <Card className="glass-panel sticky top-24 border-white/5 overflow-hidden bg-black/40 shadow-xl backdrop-blur-xl">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
        <h3 className="font-bold flex items-center gap-2 text-white">
          <Users className="w-5 h-5 text-primary drop-shadow-md" /> Friends Activity
        </h3>
      </div>
      <div className="p-4 space-y-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-full bg-background/40" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-background/40" />
                <Skeleton className="h-3 w-1/2 bg-background/40" />
              </div>
            </div>
          ))
        ) : friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-white/40" />
            </div>
            <p className="text-sm font-medium text-white/80">No friends activity yet</p>
            <p className="text-xs text-white/50 mt-1">When friends play music, it will show here.</p>
          </div>
        ) : (
          friends.map((friend: any) => (
            <div key={friend.id} className="flex gap-3 group cursor-pointer" onClick={() => friend.roomId && router.push(`/room/${friend.roomId}`)}>
              <div className="relative">
                <Avatar className="w-10 h-10 border border-white/10 shadow-sm">
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${friend.friend_id}`} />
                  <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                {/* Mocking random online status for visual effect if DB doesn't have it yet */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors text-white">{friend.friend_name}</p>
                  <Activity className="w-3 h-3 text-green-500 animate-pulse drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
                </div>
                <div className="mt-1">
                  {/* Mocking listening status since backend doesn't track it yet */}
                  <p className="text-xs truncate text-white/80">Listening to Vibes</p>
                  <p className="text-xs truncate text-white/50">
                    <Music className="w-3 h-3 inline mr-1 opacity-70" />
                    Unknown Artist
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        
        <Button variant="outline" className="w-full text-xs text-white/70 mt-4 border-white/10 hover:bg-white/10">
          Find More Friends
        </Button>
      </div>
    </Card>
  );
}
