export type MemberRole = 'Host' | 'Moderator' | 'Listener';

export interface RoomMember {
  id: string | number;
  name: string;
  avatar: string;
  role: MemberRole;
  isSpeaking: boolean;
  isMuted: boolean;
  isTyping: boolean;
}

export interface ChatMessage {
  id: string;
  user_id: string | number;
  user_name: string;
  content: string;
  type: 'text' | 'system';
  timestamp: number;
}

export interface ActivityEvent {
  id: string;
  type: 'join' | 'leave' | 'add_song' | 'play_song' | 'upvote' | 'voice_join';
  user_name: string;
  detail?: string;
  timestamp: number;
}

export interface RoomReaction {
  id: string;
  emoji: string;
  right: number; // percentage from right
}

// Event Types for Simulation Service
export type RoomEventType = 
  | 'member_updated' 
  | 'member_joined'
  | 'member_left'
  | 'typing_changed'
  | 'message_received'
  | 'reaction_sent'
  | 'activity_logged'
  | 'queue_updated'
  | 'now_playing_changed';

export type RoomEventPayload = any; // Can be strongly typed later

export interface RoomEvent {
  type: RoomEventType;
  payload: RoomEventPayload;
}
