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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera } from 'lucide-react';

const STICKER_AVATARS = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Felix",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/micah/svg?seed=Jack&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/micah/svg?seed=Jasmine&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Leo",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Mia",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Jude",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Avery",
  "https://api.dicebear.com/7.x/micah/svg?seed=Simon&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/micah/svg?seed=Max&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Caleb&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Sam",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot1",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Robot2",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Lorelei1",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Lorelei2",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel1",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel2",
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
  const [editForm, setEditForm] = useState({ name: '', bio: '', profile_picture: '' as string | null });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        const authUser = JSON.parse(storedUser);

        const res = await fetch(`/api/profile/${authUser.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user?.name || data.name) {
            const u = data.user || data;
            setUserInfo(prev => ({ 
              ...prev, 
              name: u.name, 
              email: u.email, 
              handle: `@${u.name.toLowerCase().replace(/\s+/g, '')}`,
              profile_picture: u.profile_picture 
            }));
            setEditForm({ name: u.name, bio: userInfo.bio, profile_picture: u.profile_picture });
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  const connectSpotify = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/spotify/login?userId=1`);
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
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      const authUser = JSON.parse(storedUser);
      const token = localStorage.getItem('token');

      const res = await fetch(`/api/profile/${authUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          name: editForm.name,
          profile_picture: editForm.profile_picture
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setUserInfo(prev => ({ 
          ...prev, 
          name: editForm.name, 
          bio: editForm.bio,
          profile_picture: editForm.profile_picture
        }));
        
        // Update local storage so navbar picks it up on next reload
        const newLocalUser = { ...authUser, name: editForm.name, profile_picture: editForm.profile_picture };
        localStorage.setItem('user', JSON.stringify(newLocalUser));
        
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
            <div className="relative group w-32 h-32 md:w-40 md:h-40">
              <Avatar className="w-full h-full border-4 border-background shadow-2xl bg-black">
                 <AvatarImage src={(isEditing ? editForm.profile_picture : userInfo.profile_picture) || ''} alt="Profile" className="object-cover bg-primary/20" />
                 <AvatarFallback className="text-4xl bg-primary/20 text-primary font-bold">
                   {(isEditing ? editForm.name : userInfo.name) ? (isEditing ? editForm.name : userInfo.name).substring(0, 2).toUpperCase() : 'U'}
                 </AvatarFallback>
              </Avatar>
              
              {isEditing && (
                <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                  <DialogTrigger asChild>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-4 border-transparent z-20">
                      <Camera className="w-8 h-8 text-white mb-1" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Change</span>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="bg-background border-white/10 sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Choose a Profile Sticker</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      {STICKER_AVATARS.map((url, i) => (
                        <div 
                          key={i} 
                          onClick={() => {
                            setEditForm({ ...editForm, profile_picture: url });
                            setIsAvatarDialogOpen(false);
                          }}
                          className="aspect-square rounded-2xl overflow-hidden bg-white/5 border-2 border-transparent hover:border-primary cursor-pointer transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
                        >
                          <img src={url} alt={`Sticker ${i}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-muted-foreground">Or provide a custom image URL:</span>
                      <Input 
                        placeholder="https://..." 
                        value={editForm.profile_picture || ''}
                        onChange={(e) => setEditForm({...editForm, profile_picture: e.target.value})}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
        
        <div className="flex-1 space-y-2 mt-4 md:mt-0">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h1 className="text-3xl md:text-4xl font-extrabold text-white">{userInfo.name}</h1>
                 <p className="text-primary font-medium">{userInfo.handle}</p>
              </div>
              <div className="flex gap-3">
                 <Button variant="outline" className="rounded-full bg-background/50 backdrop-blur-sm hover:bg-white/10 border-white/10" onClick={() => {
                    if (isEditing) {
                       setEditForm({ name: userInfo.name, bio: userInfo.bio, profile_picture: userInfo.profile_picture }); // Reset form
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
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Primary Content (Left/Center) */}
        <div className="lg:col-span-2 space-y-10">
          <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5 h-full flex flex-col items-center justify-center min-h-[300px]">
            <Sparkles className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">More coming soon!</h3>
            <p className="text-muted-foreground">We are working on adding your listening activity, top artists, and playlists here.</p>
          </div>
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}} />
    </div>
  );
}
