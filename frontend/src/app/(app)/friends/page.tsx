'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, UserPlus, Users, Headphones, Heart, Mic, 
  Check, X, MoreHorizontal, MessageSquare, Play, 
  Music, Sparkles, Activity, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- MOCK DATA ---
const ACTIVITIES = [
  { 
    id: 1, 
    user: { name: "Alex", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150" }, 
    type: "listening", 
    content: "After Hours", 
    subcontent: "The Weeknd", 
    time: "2 mins ago",
    icon: Headphones,
    color: "text-blue-400 bg-blue-500/10" 
  },
  { 
    id: 2, 
    user: { name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" }, 
    type: "liked", 
    content: "Midnight City", 
    subcontent: "M83", 
    time: "5 mins ago",
    icon: Heart,
    color: "text-pink-400 bg-pink-500/10" 
  },
  { 
    id: 3, 
    user: { name: "John", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150" }, 
    type: "joined", 
    content: "Indie Lovers Community", 
    subcontent: "", 
    time: "1 hour ago",
    icon: Users,
    color: "text-purple-400 bg-purple-500/10" 
  },
  { 
    id: 4, 
    user: { name: "Emma", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150" }, 
    type: "listening", 
    content: "Cruel Summer", 
    subcontent: "Taylor Swift", 
    time: "2 hours ago",
    icon: Headphones,
    color: "text-blue-400 bg-blue-500/10" 
  },
];

const PENDING_REQUESTS = [
  {
    id: 1,
    name: "Alex",
    avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=150&h=150",
    context: "12 Mutual Friends"
  },
  {
    id: 2,
    name: "Sarah",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    context: "Likes Rock & Jazz"
  }
];

const FRIENDS_LIST = [
  { id: 1, name: "Jessica Alba", online: true, status: "Listening to Starboy", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: 2, name: "David Chen", online: true, status: "In Synthwave City", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: 3, name: "Maria Garcia", online: false, status: "Last seen 2h ago", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: 4, name: "James Smith", online: true, status: "Listening to Jazz", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: 5, name: "Linda Taylor", online: false, status: "Last seen yesterday", avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: 6, name: "Robert Wilson", online: true, status: "Online", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150" },
];

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');

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
          {/* Decorative Floating Notes */}
          <div className="absolute top-8 right-20 opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>
            <Music className="w-12 h-12 text-white" />
          </div>
          <div className="absolute bottom-8 right-40 opacity-10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
            <Music className="w-16 h-16 text-white" />
          </div>
          <div className="absolute top-16 right-64 opacity-15 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          {/* Gradient Overlay */}
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
                <span className="text-2xl font-black text-white">245</span>
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Friends</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white flex items-center gap-2">
                  18 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-1" />
                </span>
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Online</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white flex items-center gap-2">
                  12 <Activity className="w-5 h-5 text-fuchsia-400" />
                </span>
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Listening Together</span>
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
                Requests <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">2</span>
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="rounded-full px-8 h-full text-base data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                Suggestions
              </TabsTrigger>
              <TabsTrigger value="following" className="rounded-full px-8 h-full text-base data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                Following
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
                    {ACTIVITIES.map((activity, i) => (
                      <div key={activity.id} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                        <Avatar className="w-12 h-12 border-2 border-transparent group-hover:border-primary/50 transition-colors">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-white/90">
                            <span className="font-bold text-white">{activity.user.name}</span> 
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
                        
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.color}`}>
                          <activity.icon className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Friends Grid */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      All Friends
                    </h2>
                    <Button variant="ghost" className="text-muted-foreground hover:text-white">
                      <Search className="w-4 h-4 mr-2" /> Find
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FRIENDS_LIST.map((friend) => (
                      <div key={friend.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all cursor-pointer group">
                        <div className="relative">
                          <Avatar className="w-14 h-14 border-2 border-transparent group-hover:border-primary/50 transition-all">
                            <AvatarImage src={friend.avatar} />
                            <AvatarFallback>{friend.name[0]}</AvatarFallback>
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
                    ))}
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
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">2</span>
                </h2>
                
                <div className="space-y-4">
                  {PENDING_REQUESTS.map((req) => (
                    <div key={req.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-16 h-16 border-2 border-transparent group-hover:border-primary/30 transition-colors">
                          <AvatarImage src={req.avatar} />
                          <AvatarFallback>{req.name[0]}</AvatarFallback>
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
                  ))}
                </div>
              </motion.div>
            )}

            {/* OTHER TABS (Placeholders for now) */}
            {(activeTab === 'suggestions' || activeTab === 'following') && (
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
