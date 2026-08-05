import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmojiPicker from 'emoji-picker-react';
import { ChatMessage, RoomMember } from '@/types/room';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatPanelProps {
  messages: ChatMessage[];
  typingUsers: number[];
  members: RoomMember[];
  onSendMessage: (content: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, typingUsers, members, onSendMessage }) => {
  const [chatInput, setChatInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
    setShowEmojiPicker(false);
  };

  const getTypingText = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) {
      const user = members.find(m => m.id === typingUsers[0]);
      return `${user?.name || 'Someone'} is typing...`;
    }
    return `${typingUsers.length} people are typing...`;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative bg-black/10 backdrop-blur-md rounded-xl border border-white/5">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm opacity-70">
            <p className="font-medium">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMe = msg.user_id === 1; // Assuming 1 is current user
              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex flex-col \${isMe ? 'items-end' : 'items-start'}`}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-[10px] text-white/50 mb-1 px-1 font-medium tracking-wide hover:text-white transition-colors cursor-pointer outline-none text-left">
                      {msg.user_name}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isMe ? 'end' : 'start'} className="w-48 bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
                      <DropdownMenuLabel className="text-xs font-bold text-white">{msg.user_name}</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="text-xs text-white/60 focus:bg-transparent cursor-default flex justify-between">
                        ID: <span className="font-mono text-[10px] text-white/40">{msg.user_id}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs font-bold cursor-pointer text-primary focus:text-primary focus:bg-primary/20 mt-1" onClick={() => console.log('Add friend', msg.user_id)}>
                        Add to Friends
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm backdrop-blur-md \${isMe ? 'bg-primary/80 text-white rounded-br-sm border border-primary/50' : 'bg-white/10 text-white rounded-bl-sm border border-white/10'}`}>
                    {msg.content}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        
        {typingUsers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-start"
          >
            <span className="text-[10px] text-muted-foreground mb-1 px-1 font-medium tracking-wide">{getTypingText()}</span>
            <div className="bg-black/40 text-foreground rounded-2xl rounded-bl-sm border border-white/5 px-4 py-3 shadow-sm flex items-center gap-1 w-16 h-10">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-xl relative z-50 rounded-b-xl">
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-[calc(100%+12px)] left-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10"
            >
              <EmojiPicker onEmojiClick={(e) => setChatInput(prev => prev + e.emoji)} theme={'dark' as any} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`shrink-0 rounded-full h-10 w-10 border-white/10 transition-colors \${showEmojiPicker ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}
          >
            <Smile className="w-5 h-5" />
          </Button>
          <Input 
            type="text" 
            placeholder="Type a message..." 
            value={chatInput} 
            onChange={(e) => setChatInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            className="flex-1 bg-white/5 border-white/10 rounded-full h-10 focus-visible:ring-primary/50 transition-shadow text-white placeholder:text-white/40"
          />
          <Button onClick={handleSend} size="icon" className="shrink-0 rounded-full h-10 w-10 bg-primary/80 hover:bg-primary text-white border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-transform active:scale-95" disabled={!chatInput.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
