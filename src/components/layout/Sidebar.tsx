"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, Monitor, Globe, Users, Library, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const navItems = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Discover", href: "/discover", icon: Compass },
  { name: "Rooms", href: "/rooms", icon: Monitor },
  { name: "Communities", href: "/communities", icon: Globe },
  { name: "Friends", href: "/friends", icon: Users },
  { name: "Library", href: "/library", icon: Library },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ unreadCount, toggleNotifs }: { unreadCount: number, toggleNotifs: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border/50 bg-background/50 backdrop-blur-xl hidden md:flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
          Sonexa
        </h2>
      </div>

      <ScrollArea className="flex-1 px-4 pb-20">
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-all",
                    isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
