"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, X, Clock, Music, User, Disc, PlayCircle, ListMusic } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

// Mock Data
const MOCK_RESULTS = {
  songs: [
    { id: 1, title: 'Starboy', artist: 'The Weeknd', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop' },
    { id: 2, title: 'Blinding Lights', artist: 'The Weeknd', image: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?w=100&h=100&fit=crop' },
  ],
  artists: [
    { id: 1, name: 'The Weeknd', followers: '100M', image: 'https://images.unsplash.com/photo-1549834125-82d3c48159a3?w=100&h=100&fit=crop' },
    { id: 2, name: 'Taylor Swift', followers: '95M', image: 'https://images.unsplash.com/photo-1516280440502-69f8021d74e8?w=100&h=100&fit=crop' }
  ],
  albums: [
    { id: 1, title: 'After Hours', artist: 'The Weeknd', image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop' },
    { id: 2, title: 'Midnights', artist: 'Taylor Swift', image: 'https://images.unsplash.com/photo-1516280440502-69f8021d74e8?w=100&h=100&fit=crop' }
  ],
  playlists: [
    { id: 1, title: 'Synthwave Essentials', creator: 'Sonexa', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop' },
    { id: 2, title: 'Deep Focus', creator: 'Sonexa', image: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=100&h=100&fit=crop' }
  ],
  users: [
    { id: 1, name: 'Alex Johnson', handle: '@alexj', image: 'https://i.pravatar.cc/150?u=1' },
    { id: 2, name: 'Sarah Chen', handle: '@sarahc', image: 'https://i.pravatar.cc/150?u=2' }
  ]
}

import { usePlayer } from "@/context/PlayerContext"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

export function SmartSearch() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { playSong } = usePlayer()

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 500)
    return () => clearTimeout(timer)
  }, [query])

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(debouncedQuery)}`)
      if (!res.ok) throw new Error('Search failed')
      return { songs: await res.json() } as any
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  })

  // Keyboard navigation state
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const allItems = React.useMemo(() => {
    if (!searchResults) return []
    return [
      ...(searchResults.songs || []),
      ...(searchResults.artists || []),
      ...(searchResults.playlists || []),
      ...(searchResults.rooms || [])
    ]
  }, [searchResults])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < allItems.length) {
        const item = allItems[selectedIndex]
        if ('uri' in item) handlePlaySong(item) // It's a song
      } else {
        handleSelectText(query)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    setSelectedIndex(-1)
  }, [debouncedQuery])

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch (e) {}
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSelectText = (text: string) => {
    saveRecentSearch(text)
    setQuery(text)
    setIsOpen(false)
    router.push(`/search?q=${encodeURIComponent(text)}`)
  }

  const handlePlaySong = (song: any) => {
    saveRecentSearch(song.title)
    setIsOpen(false)
    playSong({
      song_uri: song.uri,
      song_title: song.title,
      song_artist: song.artist,
      song_image: song.image
    })
  }

  const removeRecent = (e: React.MouseEvent, text: string) => {
    e.stopPropagation()
    const updated = recentSearches.filter(s => s !== text)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    const regex = new RegExp(`(${q})`, 'gi');
    return text.split(regex).map((part, i) => 
      part.toLowerCase() === q.toLowerCase() ? <strong key={i} className="text-primary">{part}</strong> : part
    );
  }

  let globalIndex = -1;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl hidden md:block z-50">
      <div className="relative group">
        <Search className={`absolute left-3 top-2.5 h-4 w-4 transition-colors ${isOpen ? 'text-primary' : 'text-muted-foreground'}`} />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for songs, artists, playlists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={`w-full bg-background/60 pl-10 pr-10 rounded-full border transition-all duration-300 ${isOpen ? 'border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)] bg-background/90' : 'border-border/50 hover:border-primary/50 hover:bg-background/80'}`}
        />
        {query && (
          <X 
            className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
          />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 left-0 w-full bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            <ScrollArea className="max-h-[70vh] p-4">
              {!debouncedQuery ? (
                // Show Recent Searches when empty
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground px-2 uppercase tracking-wider">Recent Searches</h3>
                  {recentSearches.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-2 py-4 text-center">No recent searches.</p>
                  ) : (
                    <div className="space-y-1">
                      {recentSearches.map((recent, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => handleSelectText(recent)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-sm font-medium">{recent}</span>
                          </div>
                          <X 
                            className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all" 
                            onClick={(e) => removeRecent(e, recent)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Show actual results
                <div className="space-y-6">
                  {isLoading && (
                    <div className="flex justify-center p-4">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                  
                  {!isLoading && searchResults && (
                    <>
                      {searchResults.songs?.length > 0 && (
                        <section>
                          <h3 className="text-sm font-semibold text-muted-foreground px-2 mb-2 flex items-center gap-2">
                            <Music className="w-4 h-4" /> Songs
                          </h3>
                          <div className="space-y-1">
                            {searchResults.songs.map((song: any, i: number) => {
                              globalIndex++;
                              const isActive = globalIndex === selectedIndex;
                              return (
                                <div key={song.uri} onClick={() => handlePlaySong(song)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer group transition-all ${isActive ? 'bg-primary/20 border-primary/50' : 'hover:bg-white/5'}`}>
                                  <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                                    <img src={song.image} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><PlayCircle className="w-5 h-5 text-white" /></div>
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{highlightMatch(song.title, debouncedQuery)}</span>
                                    <span className="text-xs text-muted-foreground truncate">{highlightMatch(song.artist, debouncedQuery)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      )}

                      {searchResults.playlists?.length > 0 && (
                        <section>
                          <h3 className="text-sm font-semibold text-muted-foreground px-2 mb-2 flex items-center gap-2">
                            <ListMusic className="w-4 h-4" /> Playlists
                          </h3>
                          <div className="space-y-1">
                            {searchResults.playlists.map((pl: any) => {
                              globalIndex++;
                              const isActive = globalIndex === selectedIndex;
                              return (
                                <div key={pl.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer group transition-all ${isActive ? 'bg-primary/20 border-primary/50' : 'hover:bg-white/5'}`}>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{highlightMatch(pl.title, debouncedQuery)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      )}
                      
                      {/* Similar sections for Artists, Rooms can be added here following the same globalIndex pattern */}
                      {allItems.length === 0 && (
                        <p className="text-sm text-muted-foreground px-2 py-4 text-center">No results found for "{debouncedQuery}"</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
            
            {/* Sticky footer for full search */}
            {query && (
              <div 
                className="p-3 border-t border-border/50 bg-background/50 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors group"
                onClick={() => handleSelectText(query)}
              >
                <span className="text-sm font-medium text-primary flex items-center gap-2">
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
                  Search for "{query}"
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
