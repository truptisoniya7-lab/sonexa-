'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, UserPlus, Users, Headphones, Heart, Mic, 
  Check, X, MoreHorizontal, MessageSquare, Play, 
  Music, Sparkles, Activity, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Friends List
  const { data: friendsList = [], isLoading: isLoadingFriends } = useQuery({
    queryKey: ['friends-list'],
    queryFn: async () => {
      const res = await fetch('/api/friends/list');
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Fetch Friend Activity
  const { data: activities = [], isLoading: isLoadingActivities } = useQuery({
    queryKey: ['friends-activity'],
    queryFn: async () => {
      const res = await fetch('/api/friends/activity');
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Fetch Pending Requests
  const { data: pendingRequests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ['friends-requests'],
    queryFn: async () => {
      const res = await fetch('/api/friends/requests');
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Filter Friends
  const filteredFriends = friendsList.filter((friend: any) => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth">
      <div className="max-w-[1200px] mx-auto w-full px-6 py-8 space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-20">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Friends</h1>
            <p className="text-lg text-muted-foreground">Build your Sonexa community.</p>
          </div>
          
          <div className="flex w-full md:w-auto gap-4 items-center">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search Friends..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 rounded-full h-12 text-base focus-visible:ring-primary focus-visible:border-primary transition-all hover:bg-white/10 shadow-inner"
              />
            </div>
            <Button className="shrink-0 rounded-full h-12 px-6 shadow-xl font-bold transition-transform hover:scale-105 bg-primary text-white hover:bg-primary/90">
              <UserPlus className="w-5 h-5 mr-2" />
              Invite
            </Button>
          </div>
        </header>

        {/* Hero Banner */}
        <div className="w-full rounded-[2rem] overflow-hidden relative shadow-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 p-6 md:p-8 md:py-10 border border-white/10">
          <div className="absolute top-8 right-20 opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>
            <Music className="w-12 h-12 text-white" />
          </div>
          <div className="absolute bottom-8 right-40 opacity-10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
            <Music className="w-16 h-16 text-white" />
          </div>
          <div className="absolute top-16 right-64 opacity-15 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          
          <div className="relative z-10 max-w-2xl flex flex-col justify-center h-full">
            <div className="flex items-center gap-2 text-primary-foreground/80 font-semibold mb-2 text-xs tracking-widest uppercase">
              <Users className="w-4 h-4" />
              Your Network
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
              Connect with music lovers, discover what your friends are listening to, and share playlists.
            </h2>
            
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">{friendsList.length || 0}</span>
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Friends</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white flex items-center gap-2">
                  {friendsList.filter((f: any) => f.online).length || 0} <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-1" />
                </span>
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Online</span>
              </div>
            </div>
            
            <div>
              <Button size="lg" className="mt-6 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-xl font-bold px-6 h-12 text-sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Friends to Sonexa
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white/5 border border-white/10 rounded-full h-14 p-1 w-full justify-start overflow-x-auto hide-scrollbar">
              <TabsTrigger value="friends" className="rounded-full px-8 h-full text-base data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                Friends
              </TabsTrigger>
              <TabsTrigger value="requests" className="rounded-full px-8 h-full text-base data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                Requests {pendingRequests.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>}
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="rounded-full px-8 h-full text-base data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                Suggestions
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Main Content Area Based on Tabs */}
          <AnimatePresence mode="wait">
            
            {/* FRIENDS TAB CONTENT */}
            {activeTab === 'friends' && (
              <motion.div 
                key="friends"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Left Column: Friend Activity */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">Friend Activity</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {isLoadingActivities ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))
                    ) : activities.length > 0 ? (
                      activities.map((activity: any, i: number) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                          <Avatar className="w-12 h-12 border-2 border-transparent group-hover:border-primary/50 transition-colors">
                            <AvatarImage src={activity.user?.avatar} />
                            <AvatarFallback>{activity.user?.name?.[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-1">
                            <p className="text-sm text-white/90">
                              <span className="font-bold text-white">{activity.user?.name}</span> 
                              {activity.type === 'listening' ? ' is listening to' : 
                               activity.type === 'liked' ? ' liked' : ' joined'}
                            </p>
                            <div className="flex flex-col">
                              <span className="font-bold text-white line-clamp-1">{activity.content}</span>
                              {activity.subcontent && (
                                <span className="text-xs text-muted-foreground">{activity.subcontent}</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {activity.time}
                            </p>
                          </div>
                          
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.color || 'bg-white/10'}`}>
                            {activity.type === 'listening' ? <Headphones className="w-4 h-4 text-blue-400" /> : <Activity className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5">
                        <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground text-sm">No recent friend activity.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Friends Grid */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      All Friends
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isLoadingFriends ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                          <Skeleton className="w-14 h-14 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-1/3" />
                          </div>
                        </div>
                      ))
                    ) : filteredFriends.length > 0 ? (
                      filteredFriends.map((friend: any) => (
                        <div key={friend.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all cursor-pointer group">
                          <div className="relative">
                            <Avatar className="w-14 h-14 border-2 border-transparent group-hover:border-primary/50 transition-all">
                              <AvatarImage src={friend.avatar} />
                              <AvatarFallback>{friend.name?.[0]}</AvatarFallback>
                            </Avatar>
                            {friend.online && (
                              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white truncate">{friend.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{friend.status}</p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/5 hover:bg-primary hover:text-white">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/5 hover:bg-primary hover:text-white">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center bg-white/5 rounded-2xl border border-white/5">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-white mb-2">No friends found</h3>
                        <p className="text-muted-foreground text-sm">You haven't added anyone yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* REQUESTS TAB CONTENT */}
            {activeTab === 'requests' && (
              <motion.div 
                key="requests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-3xl"
              >
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Pending Requests
                </h2>
                
                <div className="space-y-4">
                  {isLoadingRequests ? (
                     Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="flex-1 space-y-2 mt-2">
                          <Skeleton className="h-5 w-1/4" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                      </div>
                    ))
                  ) : pendingRequests.length > 0 ? (
                    pendingRequests.map((req: any) => (
                      <div key={req.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group">
                        <div className="flex items-center gap-4 flex-1">
                          <Avatar className="w-16 h-16 border-2 border-transparent group-hover:border-primary/30 transition-colors">
                            <AvatarImage src={req.avatar} />
                            <AvatarFallback>{req.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-bold text-white">{req.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{req.context}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <Button className="flex-1 sm:flex-none rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                            <Check className="w-4 h-4 mr-2" /> Accept
                          </Button>
                          <Button variant="outline" className="flex-1 sm:flex-none rounded-full bg-transparent border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20">
                            <X className="w-4 h-4 mr-2" /> Decline
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center bg-white/5 rounded-2xl border border-white/5">
                      <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-bold text-white mb-2">No pending requests</h3>
                      <p className="text-muted-foreground text-sm">You're all caught up!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SUGGESTIONS TABS (Placeholders for now) */}
            {activeTab === 'suggestions' && (
              <motion.div 
                key="other"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">More coming soon</h3>
                <p className="text-muted-foreground max-w-sm">We are working on bringing you personalized {activeTab}. Check back later!</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
