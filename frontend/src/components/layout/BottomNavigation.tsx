'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Library, Radio, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const navItems = [
  { icon: Home, label: 'Home', href: '/home' },
  { icon: Search, label: 'Search', href: '/discover' },
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
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-white/5" />
          
          <nav className="relative flex items-center justify-around h-16 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center w-full h-full min-h-[44px] min-w-[44px]"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-white"
                    )}
                  >
                    <item.icon className="w-5 h-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavIndicator"
                        className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
