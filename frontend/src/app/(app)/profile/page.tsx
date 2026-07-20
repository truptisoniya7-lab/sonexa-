'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Link as LinkIcon, Music, Users, 
  Clock, Share2, Edit3, Check, Loader2, Sparkles, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// --- MOCK DATA ---
const TOP_ARTISTS = [
  { id: 1, name: "The Weeknd", plays: "2.4K plays", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: 2, name: "Daft Punk", plays: "1.8K plays", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: 3, name: "Tame Impala", plays: "1.2K plays", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: 4, name: "Dua Lipa", plays: "950 plays", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150" },
];

const RECENT_ACTIVITY = [
  { id: 1, action: "Listened to", target: "Starboy", context: "by The Weeknd", time: "2 hours ago", icon: Music },
  { id: 2, action: "Joined community", target: "Synthwave City", context: "560 members", time: "5 hours ago", icon: Users },
  { id: 3, action: "Created playlist", target: "Late Night Drive", context: "45 songs", time: "Yesterday", icon: Activity },
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [userInfo, setUserInfo] = useState({ 
    name: '', 
    handle: '',
    bio: 'Music enthusiast. Always looking for new indie gems and synthwave beats.',
    email: '',
    profile_picture: null as string | null
  });
  const [editForm, setEditForm] = useState({ name: '', bio: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Simulated fetch
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/profile/1`);
        if (res.ok) {
          const data = await res.json();
          if (data.name) {
            setUserInfo(prev => ({ 
              ...prev, 
              name: data.name, 
              email: data.email, 
              handle: `@${data.name.toLowerCase().replace(/\s+/g, '')}`,
              profile_picture: data.profile_picture 
            }));
            setEditForm({ name: data.name, bio: userInfo.bio });
          }
          if (data.streaming_accounts?.some((acc: any) => acc.provider === 'spotify')) {
            setIsSpotifyConnected(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile (using mock data instead)', err);
      }
    };
    fetchProfile();
  }, []);

  const connectSpotify = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/spotify/login?userId=1`);
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to get Spotify login URL', error);
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/profile/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editForm.name })
      });
      
      if (res.ok) {
        setUserInfo(prev => ({ ...prev, name: editForm.name, bio: editForm.bio }));
        setIsEditing(false);
      } else {
        console.error('Failed to update profile');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth pb-12">
      
      {/* 1. Hero Header Section */}
      <div className="relative w-full h-64 md:h-80 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
         <div className="absolute inset-0 bg-black/20" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1200px] overflow-hidden pointer-events-none">
            <div className="absolute top-4 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-4 left-20 w-48 h-48 bg-black/20 rounded-full blur-2xl" />
         </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-6 relative -mt-20 md:-mt-24 z-10 flex flex-col md:flex-row gap-6 md:items-end">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-2xl bg-black">
               {userInfo.profile_picture && <AvatarImage src={userInfo.profile_picture} alt="Profile" className="object-cover" />}
               <AvatarFallback className="text-4xl bg-primary/20 text-primary font-bold">
                 {userInfo.name ? userInfo.name.substring(0, 2).toUpperCase() : 'U'}
               </AvatarFallback>
            </Avatar>
        
        <div className="flex-1 space-y-2 mt-4 md:mt-0">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h1 className="text-3xl md:text-4xl font-extrabold text-white">{userInfo.name}</h1>
                 <p className="text-primary font-medium">{userInfo.handle}</p>
              </div>
              <div className="flex gap-3">
                 <Button variant="outline" className="rounded-full bg-background/50 backdrop-blur-sm hover:bg-white/10 border-white/10" onClick={() => {
                    if (isEditing) {
                       setEditForm({ name: userInfo.name, bio: userInfo.bio }); // Reset form
                       setIsEditing(false);
                    } else {
                       setIsEditing(true);
                    }
                 }}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                 </Button>
                 <Button variant="default" className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                 </Button>
              </div>
           </div>
           
           <p className="text-muted-foreground max-w-2xl">{userInfo.bio}</p>
           
           <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-white/80 pt-2">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> 1.2K Followers</span>
              <span className="text-white/20">•</span>
              <span>450 Following</span>
              <span className="text-white/20">•</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> 15K Mins Listened</span>
           </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Primary Content (Left/Center) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Top Artists Rail */}
          <section>
             <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
               <Sparkles className="w-5 h-5 text-primary" /> Your Top Artists
             </h2>
             <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
               {TOP_ARTISTS.map((artist) => (
                 <div key={artist.id} className="snap-start shrink-0 w-36 group cursor-pointer text-center">
                    <div className="w-36 h-36 rounded-full overflow-hidden mb-3 relative border-4 border-transparent group-hover:border-primary/50 transition-all shadow-lg">
                       <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Music className="w-8 h-8 text-white drop-shadow-md" />
                       </div>
                    </div>
                    <h3 className="font-bold text-white truncate">{artist.name}</h3>
                    <p className="text-xs text-muted-foreground">{artist.plays}</p>
                 </div>
               ))}
             </div>
          </section>

          {/* Recent Activity */}
          <section>
             <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
               <Activity className="w-5 h-5 text-primary" /> Recent Activity
             </h2>
             <div className="space-y-4">
               {RECENT_ACTIVITY.map((activity) => (
                 <div key={activity.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                       <activity.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                       <p className="text-white/90">
                         <span className="text-muted-foreground">{activity.action}</span>{" "}
                         <span className="font-bold text-white">{activity.target}</span>
                       </p>
                       <p className="text-sm text-muted-foreground">{activity.context}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                 </div>
               ))}
             </div>
          </section>

        </div>

        {/* Secondary Content (Right Sidebar) */}
        <div className="space-y-8">
           
           {/* Connected Services */}
           <Card className="glass-panel border-white/10 bg-black/20">
             <CardHeader>
               <CardTitle className="flex items-center gap-2 text-lg">
                  <LinkIcon className="w-5 h-5 text-primary" />
                  Connected Services
               </CardTitle>
               <CardDescription>Link your streaming accounts for full functionality.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                
                {/* Spotify Connection */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#1DB954]/50 transition-colors">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center shrink-0 shadow-[0_0_15px_-3px_rgba(29,185,84,0.5)]">
                         <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.24 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.3z"/></svg>
                      </div>
                      <div>
                         <h4 className="font-bold text-white">Spotify</h4>
                         <p className="text-xs text-muted-foreground">{isSpotifyConnected ? 'Premium Connected' : 'Not Connected'}</p>
                      </div>
                   </div>
                   <Button 
                      onClick={connectSpotify} 
                      disabled={loading || isSpotifyConnected} 
                      size="sm"
                      className={`rounded-full font-bold ${isSpotifyConnected ? 'bg-[#1DB954]/20 text-[#1DB954] hover:bg-[#1DB954]/20' : 'bg-[#1DB954] text-white hover:bg-[#1DB954]/90'}`}
                   >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSpotifyConnected ? <Check className="w-4 h-4" /> : 'Connect')}
                   </Button>
                </div>

                {/* Discord Connection (Placeholder) */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 opacity-50 grayscale">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center shrink-0">
                         <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                         <h4 className="font-bold text-white">Discord</h4>
                         <p className="text-xs text-muted-foreground">Coming Soon</p>
                      </div>
                   </div>
                   <Button size="sm" variant="outline" disabled className="rounded-full">Link</Button>
                </div>
             </CardContent>
           </Card>

           {/* Account Settings */}
           <Card className="glass-panel border-white/10 bg-black/20">
             <CardHeader>
               <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="w-5 h-5 text-primary" />
                  Account Details
               </CardTitle>
             </CardHeader>
             <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground font-medium">Display Name</label>
                    <Input 
                      type="text" 
                      value={isEditing ? editForm.name : userInfo.name} 
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white/5 border-white/10 focus-visible:ring-primary disabled:opacity-70" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground font-medium">Bio</label>
                    <Input 
                      type="text" 
                      value={isEditing ? editForm.bio : userInfo.bio} 
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white/5 border-white/10 focus-visible:ring-primary disabled:opacity-70" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground font-medium">Email Address</label>
                    <Input 
                      type="email" 
                      defaultValue={userInfo.email} 
                      disabled 
                      className="bg-white/5 border-white/10 opacity-50" 
                    />
                  </div>
                  
                  {isEditing && (
                    <Button type="button" disabled={isSaving} className="w-full rounded-full font-bold mt-2" onClick={handleSaveProfile}>
                       {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                    </Button>
                  )}
                </form>
             </CardContent>
           </Card>
           
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
