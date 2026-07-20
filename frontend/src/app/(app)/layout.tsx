'use client';
import { useState, useEffect } from 'react';
import { PlayerProvider } from '@/context/PlayerContext';
import GlobalPlayer from '@/components/GlobalPlayer';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/notifications/1`) // Mock user 1
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(console.error);
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <PlayerProvider>
      <div className="flex min-h-screen w-full relative bg-transparent">
        <GlobalBackground />
        <Sidebar unreadCount={unreadCount} toggleNotifs={() => setShowNotifs(!showNotifs)} />
        
        <div className="flex flex-col flex-1 md:pl-64">
          <TopBar unreadCount={unreadCount} toggleNotifs={() => setShowNotifs(!showNotifs)} />
          
          <main className="flex-1 p-4 md:p-8 pb-32">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed bottom-24 left-4 md:left-72 z-50 w-80"
            >
              <Card className="p-4 shadow-xl border-border/50 bg-background/80 backdrop-blur-xl">
                <h4 className="font-semibold mb-4 pb-2 border-b">Notifications</h4>
                {notifications.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center">No new notifications.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)} 
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${n.is_read ? 'opacity-70 hover:bg-muted/50' : 'bg-primary/10 hover:bg-primary/20'}`}
                      >
                        <p className="text-sm font-medium mb-1">{n.message}</p>
                        <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="fixed bottom-0 left-0 right-0 z-50">
          <GlobalPlayer />
        </div>
      </div>
    </PlayerProvider>
  );
}
