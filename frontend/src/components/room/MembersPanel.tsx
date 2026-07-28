import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RoomMember } from '@/types/room';

interface MembersPanelProps {
  members: RoomMember[];
}

export const MembersPanel: React.FC<MembersPanelProps> = ({ members }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 pl-2">
        Active Members - {members.length}
      </h3>
      <AnimatePresence>
        {members.map((member) => (
          <motion.div 
            key={member.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 \${member.isSpeaking ? 'bg-primary/5 border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.1)]' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
          >
            <div className="relative">
              <Avatar className={`w-10 h-10 border-2 transition-colors duration-300 \${member.isSpeaking ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'border-white/10'}`}>
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
              {member.isSpeaking && (
                 <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full animate-pulse"></span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-foreground">{member.name}</p>
              <p className="text-xs text-primary/80 font-medium">{member.role}</p>
            </div>
            
            <div className="shrink-0">
              {member.isSpeaking ? (
                <div className="bg-green-500/10 p-2 rounded-full">
                   <Mic className="w-4 h-4 text-green-500 animate-pulse" />
                </div>
              ) : member.isMuted ? (
                <div className="p-2 rounded-full opacity-30">
                   <MicOff className="w-4 h-4 text-muted-foreground" />
                </div>
              ) : (
                <div className="p-2 rounded-full opacity-50">
                   <Mic className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
