import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { SessionData, Message, User } from '../types';

interface SessionContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  sessions: SessionData[];
  messages: Message[];
  addSession: (session: Omit<SessionData, 'id' | 'createdAt'>) => string;
  deleteSession: (id: string) => Promise<void>;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  getSession: (id: string) => SessionData | undefined;
  getSessionMessages: (sessionId: string) => Message[];
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('heartmend_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [sessions, setSessions] = useState<SessionData[]>(() => {
    const saved = localStorage.getItem('heartmend_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('heartmend_messages');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (currentUser) {
       localStorage.setItem('heartmend_user', JSON.stringify(currentUser));
    } else {
       localStorage.removeItem('heartmend_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('heartmend_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('heartmend_messages', JSON.stringify(messages));
  }, [messages]);

  const addSession = (sessionData: Omit<SessionData, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    const newSession: SessionData = { 
      ...sessionData, 
      id, 
      createdAt: Date.now() 
    };
    setSessions(prev => [newSession, ...prev]);
    return id;
  };

  const deleteSession = async (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setMessages(prev => prev.filter(m => m.sessionId !== id));
  };

  const addMessage = async (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const newMessage: Message = { ...messageData, id, timestamp };
    
    setMessages(prev => [...prev, newMessage]);

    if (newMessage.role === 'user') {
      try {
        const session = sessions.find(s => s.id === newMessage.sessionId);
        const history = [...messages, newMessage].filter(m => m.sessionId === newMessage.sessionId);
        
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session, history })
        });
        const aiMessageData = await response.json();
        
        if (aiMessageData && aiMessageData.id) {
          setMessages(prev => [...prev, aiMessageData]);
        }
      } catch(e) {
         console.error("AI Error:", e);
      }
    }
  };

  const getSession = (id: string) => sessions.find(s => s.id === id);
  const getSessionMessages = (sessionId: string) => messages.filter(m => m.sessionId === sessionId);

  return (
    <SessionContext.Provider value={{ 
      currentUser, setCurrentUser, sessions, messages, 
      addSession, deleteSession, addMessage, getSession, getSessionMessages 
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessions = () => {
  const context = useContext(SessionContext);
  if (context === undefined) throw new Error('useSessions must be used within a SessionProvider');
  return context;
};
