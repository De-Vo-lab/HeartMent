export type Mode = 'CALM DOWN' | 'UNDERSTAND WHAT HAPPENED' | 'MOVE ON' | 'JUST VENT';

export interface User {
  id: string;
  username: string;
}

export interface SessionData {
  id: string;
  userId?: string;
  partnerName: string;
  duration: string;
  whoEnded: string;
  story: string;
  feeling: string;
  need: string;
  mode: Mode;
  language?: string;
  createdAt: number;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
