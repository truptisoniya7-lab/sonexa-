import React from 'react';
import { Mic, MicOff, Heart, Flame, Laugh, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoicePanelProps {
  inVoice: boolean;
  isMuted: boolean;
  onJoinVoice: () => void;
  onToggleMute: () => void;
  onSendReaction: (emoji: string) => void;
  localAudioRef: React.RefObject<HTMLAudioElement>;
  remoteAudioRef: React.RefObject<HTMLAudioElement>;
}

export const VoicePanel: React.FC<VoicePanelProps> = ({ 
  inVoice, 
  isMuted, 
  onJoinVoice, 
  onToggleMute, 
  onSendReaction, 
  localAudioRef, 
  remoteAudioRef 
}) => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/20">
      <div className="flex items-center gap-1 bg-background/40 backdrop-blur-md rounded-full px-2 py-1 border border-border/30">
        {[{icon: Heart, emoji: '❤️'}, {icon: Flame, emoji: '🔥'}, {icon: Laugh, emoji: '😂'}, {icon: PartyPopper, emoji: '🎉'}].map(({icon: Icon, emoji}) => (
          <Button 
            key={emoji} 
            variant="ghost" 
            size="icon" 
            onClick={() => onSendReaction(emoji)} 
            className="w-8 h-8 rounded-full hover:bg-accent/80 hover:scale-110 transition-all text-lg"
          >
            {emoji}
          </Button>
        ))}
      </div>

      {!inVoice ? (
        <Button 
          onClick={onJoinVoice} 
          variant="outline" 
          className="text-primary border-primary/50 hover:bg-primary/10 rounded-full px-6 shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all h-9"
        >
          <Mic className="w-4 h-4 mr-2" /> Join Voice
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button 
            onClick={onToggleMute} 
            variant={isMuted ? "destructive" : "secondary"} 
            className="min-w-[90px] rounded-full h-9 text-xs transition-colors"
          >
            {isMuted ? <MicOff className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
          <div className="flex items-center gap-2 text-green-500 font-medium text-xs bg-green-500/10 px-2 py-1.5 rounded-full shadow-inner border border-green-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
        </div>
      )}
      
      <audio ref={localAudioRef} autoPlay muted className="hidden" />
      <audio ref={remoteAudioRef} autoPlay className="hidden" />
    </div>
  );
};
