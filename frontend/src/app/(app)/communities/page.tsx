'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Users, Globe2, X, ChevronRight, Star, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Lo-Fi', 'Metal'];

export default function CommunitiesPage() {
  const router = useRouter();
  const [communities, setCommunities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}'}/communities`);
      const data = await res.json();
      if (Array.isArray(data)) setCommunities(data);
    } catch (error) {
      console.error('Failed to fetch communities', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCommunity = async () => {
    if (!newCommName.trim()) return;
    try {
      await fetch(`\${process.env.NEXT_PUBLIC_API_URL || '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}'}/communities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCommName, description: newCommDesc, owner_id: 1 })
      });
      setNewCommName('');
      setNewCommDesc('');
      setShowCreate(false);
      fetchCommunities();
    } catch (error) {
      console.error('Failed to create community', error);
    }
  };

  const joinCommunity = async (id: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/communities/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1 })
      });
      router.push(`/communities/${id}`);
    } catch (error) {
      console.error('Failed to join community', error);
    }
  };

  const filteredCommunities = communities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  // Mock splits for UI sections
  const featured = filteredCommunities.slice(0, 1);
  const joined = filteredCommunities.slice(1, 3);
  const popular = filteredCommunities.slice(3, 7);
  const recommended = filteredCommunities.slice(7);

  const renderCommunityCard = (comm: any, idx: number, highlight = false) => (
    <motion.div
      key={comm.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: idx * 0.05 }}
      className="h-full"
    >
      <Card className={`glass-panel h-full flex flex-col hover:border-primary/50 transition-colors group ${highlight ? 'border-primary/30 shadow-lg shadow-primary/10' : ''}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">{comm.name}</CardTitle>
            {highlight && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />}
          </div>
          <CardDescription className="line-clamp-2 mt-2">
            {comm.description || 'No description provided.'}
          </CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto pt-4 border-t border-border/50 justify-between">
          <div className="flex items-center text-sm text-muted-foreground font-medium">
            <Users className="w-4 h-4 mr-1.5" />
            {comm.member_count || Math.floor(Math.random() * 500) + 10} Members
          </div>
          <Button variant="outline" size="sm" onClick={() => joinCommunity(comm.id)} className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
            Join Room
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Communities</h1>
          <p className="text-muted-foreground">Find your tribe and listen together.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3 items-center">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search Communities..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 rounded-full h-10"
            />
          </div>
          <Button 
            onClick={() => setShowCreate(!showCreate)} 
            variant={showCreate ? "secondary" : "default"}
            className="shrink-0 rounded-full h-10 px-6 shadow-md"
          >
            {showCreate ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showCreate ? 'Cancel' : 'Create'}
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="glass-panel border-primary/20 mb-8">
              <CardHeader>
                <CardTitle>Start a New Community</CardTitle>
                <CardDescription>Create a space for people who share your music taste.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <Input 
                    placeholder="Community Name" 
                    value={newCommName} 
                    onChange={(e) => setNewCommName(e.target.value)} 
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Textarea 
                    placeholder="Description (What is this community about?)" 
                    rows={3} 
                    value={newCommDesc} 
                    onChange={(e) => setNewCommDesc(e.target.value)}
                    className="bg-background/50 resize-none"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={createCommunity} disabled={!newCommName.trim()}>
                  Create Community
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl bg-background/40" />
          ))}
        </div>
      ) : filteredCommunities.length === 0 ? (
        <Card className="glass-panel bg-background/40 border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Globe2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No communities found</h3>
            <p className="text-muted-foreground max-w-sm mb-6">We couldn't find any communities matching your search. Why not start one yourself?</p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Community
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Featured Community */}
          {featured.length > 0 && !searchQuery && (
            <section className="relative overflow-hidden rounded-3xl h-64 shadow-2xl group cursor-pointer border border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-105 transition-transform duration-1000 opacity-50" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Featured Community</span>
                </div>
                <h2 className="text-3xl font-extrabold mb-2">{featured[0].name}</h2>
                <p className="text-muted-foreground max-w-2xl mb-6">{featured[0].description}</p>
                <div className="flex items-center gap-4">
                  <Button onClick={() => joinCommunity(featured[0].id)} className="rounded-full shadow-lg">
                    Join Now
                  </Button>
                  <span className="text-sm font-medium text-muted-foreground flex items-center">
                    <Users className="w-4 h-4 mr-1.5" /> 1.2k Active Members
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Categories Horizontal Scroll */}
          {!searchQuery && (
            <section>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
                {CATEGORIES.map(cat => (
                  <Button key={cat} variant="outline" className="rounded-full shrink-0 bg-background/50 hover:bg-primary hover:text-primary-foreground border-border/50">
                    <Hash className="w-3 h-3 mr-1" /> {cat}
                  </Button>
                ))}
              </div>
            </section>
          )}

          {/* Joined Communities */}
          {joined.length > 0 && !searchQuery && (
            <section>
              <h2 className="text-2xl font-bold mb-6 tracking-tight flex items-center justify-between">
                Your Communities
                <Button variant="ghost" size="sm" className="text-primary">View All <ChevronRight className="w-4 h-4 ml-1" /></Button>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joined.map((comm, idx) => renderCommunityCard(comm, idx))}
              </div>
            </section>
          )}

          {/* Popular Communities */}
          {popular.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 tracking-tight">Popular Right Now</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {popular.map((comm, idx) => renderCommunityCard(comm, idx, true))}
              </div>
            </section>
          )}

          {/* Recommendations */}
          {recommended.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 tracking-tight">Recommended For You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommended.map((comm, idx) => renderCommunityCard(comm, idx))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
