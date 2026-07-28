import { useState, useEffect, useRef } from 'react';
import { roomSimulation } from '@/services/roomSimulation';
import { RoomMember, ChatMessage, ActivityEvent, RoomReaction } from '@/types/room';

const INITIAL_MEMBERS: RoomMember[] = [
  { id: 1, name: 'You (Host)', avatar: 'https://i.pravatar.cc/150?u=1', role: 'Host', isSpeaking: false, isMuted: true, isTyping: false },
  { id: 2, name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=2', role: 'Listener', isSpeaking: false, isMuted: false, isTyping: false },
  { id: 3, name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/150?u=3', role: 'Listener', isSpeaking: false, isMuted: false, isTyping: false },
];

export function useRoomSimulation(roomId: string) {
  const [members, setMembers] = useState<RoomMember[]>(INITIAL_MEMBERS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<RoomReaction[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);

  useEffect(() => {
    // Start simulation
    roomSimulation.start(roomId, INITIAL_MEMBERS);

    // Event Handlers
    const handleMemberUpdated = (updatedMembers: RoomMember[]) => {
      setMembers([...updatedMembers]);
    };

    const handleTypingChanged = ({ userId, isTyping }: { userId: number, isTyping: boolean }) => {
      setTypingUsers(prev => 
        isTyping 
          ? (prev.includes(userId) ? prev : [...prev, userId])
          : prev.filter(id => id !== userId)
      );
    };

    const handleMessageReceived = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    };

    const handleReactionSent = (reaction: RoomReaction) => {
      setReactions(prev => [...prev, reaction]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 3000); // Remove after animation completes
    };

    const handleActivityLogged = (activity: ActivityEvent) => {
      setActivities(prev => [activity, ...prev].slice(0, 10)); // Keep last 10
    };

    // Subscriptions
    roomSimulation.emitter.on('member_updated', handleMemberUpdated);
    roomSimulation.emitter.on('typing_changed', handleTypingChanged);
    roomSimulation.emitter.on('message_received', handleMessageReceived);
    roomSimulation.emitter.on('reaction_sent', handleReactionSent);
    roomSimulation.emitter.on('activity_logged', handleActivityLogged);

    return () => {
      roomSimulation.emitter.off('member_updated', handleMemberUpdated);
      roomSimulation.emitter.off('typing_changed', handleTypingChanged);
      roomSimulation.emitter.off('message_received', handleMessageReceived);
      roomSimulation.emitter.off('reaction_sent', handleReactionSent);
      roomSimulation.emitter.off('activity_logged', handleActivityLogged);
      roomSimulation.stop();
    };
  }, [roomId]);

  return {
    members,
    messages,
    reactions,
    activities,
    typingUsers,
    setMessages, // expose to allow sending local messages
  };
}
