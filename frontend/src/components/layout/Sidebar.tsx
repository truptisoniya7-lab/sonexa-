"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, Monitor, Globe, Users, Library, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"

const navItems = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Discover", href: "/discover", icon: Compass },
  { name: "Live Rooms", href: "/rooms", icon: Globe },
  { name: "Friends", href: "/friends", icon: Users },
  { name: "Library", href: "/library", icon: Library },
  { name: "Profile", href: "/profile", icon: User },
]

const onlineFriends: any[] = [];

export function Sidebar({ unreadCount, toggleNotifs }: { unreadCount: number, toggleNotifs: () => void }) {
  const pathname = usePathname()

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="hidden md:flex w-20 lg:w-64 bg-background/20 backdrop-blur-xl border border-white/5 m-4 flex-col h-[calc(100vh-2rem)] fixed left-0 top-0 z-40 overflow-hidden rounded-3xl shadow-2xl"
    >
      <div className="p-6 pb-2 hidden lg:block">
        <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 drop-shadow-glow">
          Sonexa
        </h2>
      </div>
      <div className="p-6 pb-2 block lg:hidden flex justify-center">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center font-bold text-white shadow-glow">S</div>
      </div>

      <ScrollArea className="flex-1 px-3 mt-4 pb-20">
        <nav className="flex flex-col gap-1.5 relative">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className="relative outline-none group">
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-xl shadow-glow"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div
                  className={cn(
                    "relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors z-10",
                    isActive ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground group-hover:bg-white/5"
                  )}
                >
                  <motion.div whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }} whileTap={{ scale: 0.9 }}>
                    <item.icon className="w-6 h-6 lg:w-5 lg:h-5" />
                  </motion.div>
                  <span className="hidden lg:block">{item.name}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="hidden lg:block mt-8 pt-6 border-t border-white/5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-4">Friends Online</p>
          <div className="space-y-2">
            {onlineFriends.length > 0 ? (
              onlineFriends.map((friend) => (
                <div key={friend.name} className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                  <div className="relative">
                    <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full bg-white/10" />
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${friend.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  </div>
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{friend.name}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground/80 italic text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                No friends online
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="mt-auto p-4 border-t border-white/5 hidden lg:block">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </motion.aside>
  )
}
