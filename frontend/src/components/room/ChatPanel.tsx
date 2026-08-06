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
                    <DropdownMenuTrigger asChild>
                      {!isMe && (
                        <span className="text-[10px] font-bold text-white/40 ml-1 mb-1 cursor-pointer hover:text-white transition-colors">{msg.user_name}</span>
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isMe ? 'end' : 'start'} className="w-48 bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
                      <DropdownMenuLabel className="text-xs font-bold text-white">{msg.user_name}</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="text-xs text-white/60 focus:bg-transparent cursor-default flex justify-between">
                        ID: <span className="font-mono text-[10px] text-white/40">{msg.user_id}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {isMe && (
                    <span className="text-[10px] font-bold text-white/40 mr-1 mb-1">{msg.user_name}</span>
                  )}
                  
                  <div 
                    className={`px-4 py-2 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-primary/80 text-white rounded-br-sm shadow-[0_0_15px_rgba(var(--primary),0.3)]' 
                        : 'bg-white/[0.08] text-white/90 rounded-bl-sm border border-white/[0.04]'
                    }`}
                  >
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

      <div className="p-3 border-t border-white/[0.08] bg-black/20 shrink-0">
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
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <Button 
            type="button"
            variant="ghost" 
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`shrink-0 rounded-full h-10 w-10 transition-colors ${showEmojiPicker ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
          >
            <Smile className="w-5 h-5" />
          </Button>
          <Input 
            type="text" 
            placeholder="Say something..." 
            value={chatInput} 
            onChange={(e) => setChatInput(e.target.value)} 
            className="flex-1 bg-white/[0.05] border-white/[0.08] rounded-full h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary/50 placeholder:text-white/30 text-white"
          />
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost"
            disabled={!chatInput.trim()}
            className="w-8 h-8 rounded-full text-primary hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
