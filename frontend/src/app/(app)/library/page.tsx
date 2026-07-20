'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Shuffle, Heart, Clock, Download, Star, 
  MoreVertical, Music2, ListMusic, Disc3, Mic2, 
  Search, Grid, List as ListIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- MOCK DATA ---
const PLAYLISTS = [
  { id: 1, title: "Late Night Drive", type: "Playlist", creator: "Sonexa", count: "45 Songs", image: "https://images.unsplash.com/photo-1493225457124-a1a2a4411138?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 2, title: "Workout Mix", type: "Playlist", creator: "You", count: "120 Songs", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 3, title: "Chill Vibes", type: "Playlist", creator: "Sonexa", count: "80 Songs", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 4, title: "Coding Focus", type: "Playlist", creator: "You", count: "34 Songs", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=300&h=300" },
];

const ALBUMS = [
  { id: 1, title: "After Hours", type: "Album", creator: "The Weeknd", year: "2020", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 2, title: "Random Access Memories", type: "Album", creator: "Daft Punk", year: "2013", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 3, title: "Currents", type: "Album", creator: "Tame Impala", year: "2015", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=300&h=300" },
];

const ARTISTS = [
  { id: 1, title: "The Weeknd", type: "Artist", followers: "85M", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 2, title: "Dua Lipa", type: "Artist", followers: "70M", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 3, title: "Drake", type: "Artist", followers: "92M", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300&h=300" },
  { id: 4, title: "Taylor Swift", type: "Artist", followers: "110M", image: "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&q=80&w=300&h=300" },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const renderCard = (item: any, isArtist: boolean = false) => (
    <div key={item.id} className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden flex flex-col hover:border-primary/30 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]">
      <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-md shadow-lg">
        <img 
          src={item.image} 
          alt={item.title} 
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isArtist ? 'rounded-full' : 'rounded-md'}`} 
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <Play className="w-6 h-6 ml-1" />
          </div>
        </div>
      </div>
      <h3 className="font-bold text-white text-base truncate mb-1">{item.title}</h3>
      <p className="text-xs text-muted-foreground truncate">
        {item.type} • {item.creator || item.followers || item.year}
      </p>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-background overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth">
      <div className="max-w-[1400px] mx-auto w-full px-6 py-8 space-y-10">
        
        {/* Hero Section */}
        <div className="w-full rounded-[2rem] overflow-hidden relative shadow-2xl bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-fuchsia-900/40 p-8 md:p-12 border border-white/10 backdrop-blur-md">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">
              📚 Your Library
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-6 font-medium">
              Everything you love, all in one place.
            </p>
            
            <div className="flex flex-wrap items-center gap-2 text-sm md:text-base font-semibold text-white/60 mb-8 uppercase tracking-widest">
              <span>1,248 Songs</span>
              <span className="text-white/30">•</span>
              <span>48 Playlists</span>
              <span className="text-white/30">•</span>
              <span>215 Albums</span>
              <span className="text-white/30">•</span>
              <span>86 Artists</span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_30px_-5px_rgba(139,92,246,0.6)] font-bold px-8 h-14 text-base">
                <Play className="w-5 h-5 mr-2" />
                Resume Listening
              </Button>
              <Button size="lg" variant="outline" className="rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all font-bold px-8 h-14 text-base backdrop-blur-sm">
                <Shuffle className="w-5 h-5 mr-2" />
                Shuffle All
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
             Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Liked Songs */}
            <div className="group relative overflow-hidden rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 hover:border-indigo-500/50 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.3)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all -mr-10 -mt-10" />
              <Heart className="w-8 h-8 text-indigo-400 mb-4 drop-shadow-md" />
              <h3 className="text-xl font-bold text-white mb-1">Liked Songs</h3>
              <p className="text-sm text-indigo-200/70 mb-4">1,248 Songs</p>
              <Button size="sm" className="rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-md">
                <Play className="w-4 h-4 mr-1.5" /> Play
              </Button>
            </div>

            {/* Recently Played */}
            <div className="group relative overflow-hidden rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-fuchsia-600/20 to-pink-600/20 hover:border-fuchsia-500/50 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_30px_-5px_rgba(217,70,239,0.3)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-fuchsia-500/20 transition-all -mr-10 -mt-10" />
              <Clock className="w-8 h-8 text-fuchsia-400 mb-4 drop-shadow-md" />
              <h3 className="text-xl font-bold text-white mb-1">Recently Played</h3>
              <p className="text-sm text-fuchsia-200/70 mb-4">Continue</p>
              <Button size="sm" className="rounded-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white shadow-md">
                <Play className="w-4 h-4 mr-1.5" /> Resume
              </Button>
            </div>

            {/* Downloads */}
            <div className="group relative overflow-hidden rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 hover:border-emerald-500/50 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all -mr-10 -mt-10" />
              <Download className="w-8 h-8 text-emerald-400 mb-4 drop-shadow-md" />
              <h3 className="text-xl font-bold text-white mb-1">Downloads</h3>
              <p className="text-sm text-emerald-200/70 mb-4">Offline Music</p>
              <Button size="sm" className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md">
                <Play className="w-4 h-4 mr-1.5" /> Play
              </Button>
            </div>

            {/* Favorites */}
            <div className="group relative overflow-hidden rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-amber-600/20 to-orange-600/20 hover:border-amber-500/50 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all -mr-10 -mt-10" />
              <Star className="w-8 h-8 text-amber-400 mb-4 drop-shadow-md" />
              <h3 className="text-xl font-bold text-white mb-1">Favorites</h3>
              <p className="text-sm text-amber-200/70 mb-4">Top Artists</p>
              <Button size="sm" className="rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-md">
                <Play className="w-4 h-4 mr-1.5" /> Play
              </Button>
            </div>
          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent border-none p-0 w-full justify-start overflow-x-auto hide-scrollbar gap-2">
                {['All', 'Playlists', 'Albums', 'Artists', 'Liked Songs', 'Downloads', 'History'].map(tab => {
                  const val = tab.toLowerCase();
                  return (
                    <TabsTrigger 
                      key={val} 
                      value={val} 
                      className="rounded-full px-6 py-2.5 h-auto text-sm font-semibold border border-transparent data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-white/20 hover:bg-white/5 transition-all"
                    >
                      {tab}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>

            {/* Filter / Search for active tab */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={`Filter ${activeTab}...`} 
                className="pl-9 bg-white/5 border-white/10 rounded-full h-10 text-sm focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Dynamic Content Based on Tab */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {activeTab === 'all' && (
                <>
                  <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ListMusic className="w-5 h-5 text-primary"/> Top Playlists</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {PLAYLISTS.map(p => renderCard(p))}
                    </div>
                  </section>
                  <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Disc3 className="w-5 h-5 text-primary"/> Saved Albums</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {ALBUMS.map(a => renderCard(a))}
                    </div>
                  </section>
                  <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Mic2 className="w-5 h-5 text-primary"/> Followed Artists</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {ARTISTS.map(a => renderCard(a, true))}
                    </div>
                  </section>
                </>
              )}

              {activeTab === 'playlists' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {PLAYLISTS.map(p => renderCard(p))}
                  {PLAYLISTS.map(p => renderCard({...p, id: p.id + 10}))}
                </div>
              )}

              {activeTab === 'albums' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ALBUMS.map(a => renderCard(a))}
                  {ALBUMS.map(a => renderCard({...a, id: a.id + 10}))}
                </div>
              )}

              {activeTab === 'artists' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ARTISTS.map(a => renderCard(a, true))}
                  {ARTISTS.map(a => renderCard({...a, id: a.id + 10}, true))}
                </div>
              )}

              {/* Empty States for other tabs */}
              {['liked songs', 'downloads', 'history'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <Music2 className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-2xl font-bold mb-2">It's quiet here</h3>
                  <p className="text-muted-foreground">Start adding music to your {activeTab} to see it appear here.</p>
                </div>
              )}

            </motion.div>
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
