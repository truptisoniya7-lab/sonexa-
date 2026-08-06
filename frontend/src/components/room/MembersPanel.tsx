import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
        {members.map((member, i) => (
          <motion.div 
            key={member.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.08] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className={`w-10 h-10 border border-white/10 shadow-sm transition-colors duration-300 ${member.isSpeaking ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'border-white/10'}`}>
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                {member.isSpeaking && (
                   <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full animate-pulse"></span>
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-white/90 group-hover:text-white transition-colors">{member.name}</span>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">{i === 0 ? 'Host' : member.role}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full text-white/50 hover:text-white hover:bg-white/10">
                  <UserPlus className="w-3.5 h-3.5" />
                </Button>
              </div>
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
