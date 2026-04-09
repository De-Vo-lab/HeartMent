export type Mode = 'CALM DOWN' | 'UNDERSTAND WHAT HAPPENED' | 'MOVE ON' | 'JUST VENT';

export interface SessionData {
  id: string;
  partnerName: string;
  duration: string;
  whoEnded: string;
  story: string;
  feeling: string;
  need: string;
  mode: Mode;
  createdAt: number;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
