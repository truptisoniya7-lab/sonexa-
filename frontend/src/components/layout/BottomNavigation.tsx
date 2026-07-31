'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Compass, Library, Radio, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springTransition, hoverButton } from '@/lib/animations';
import { useEffect, useState } from 'react';

const navItems = [
  { icon: Home, label: 'Home', href: '/home' },
  { icon: Compass, label: 'Discover', href: '/discover' },
  { icon: Library, label: 'Library', href: '/library' },
  { icon: Radio, label: 'Live', href: '/rooms' },
  { icon: User, label: 'Profile', href: '/profile' }
];

export function BottomNavigation() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Auto-hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-safe"
        >
          {/* Glass background with extra padding for mobile safe area at bottom */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]" />
          
          <nav className="relative flex items-center justify-around h-20 px-4 pb-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px]"
                >
                  <motion.div
                    {...hoverButton}
                    className={cn(
                      "flex items-center justify-center rounded-full transition-all relative z-10",
                      isActive ? "w-14 h-10 text-primary" : "w-12 h-12 text-white/70 hover:text-white"
                    )}
                  >
                    <item.icon className="w-6 h-6 relative z-20" strokeWidth={isActive ? 2.5 : 2} />
                    
                    {/* Glowing pill background for active state */}
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavPill"
                        className="absolute inset-0 rounded-2xl bg-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.3)] z-10"
                        transition={springTransition}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
