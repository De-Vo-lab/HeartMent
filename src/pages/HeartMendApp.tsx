import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessions } from '../store/SessionStore';
import type { Mode } from '../types';
import { Send, User, Heart } from 'lucide-react';

const HeartMendApp = () => {
  const { currentUser, addSession, addMessage, getSessionMessages } = useSessions();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
       navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionParam = params.get('session');
    if (sessionParam) {
      setActiveSessionId(sessionParam);
    }
  }, [location.search]);
  
  // Form state
  const [partnerName, setPartnerName] = useState('');
  const [duration, setDuration] = useState('');
  const [whoEnded, setWhoEnded] = useState('We mutually agreed');
  const [story, setStory] = useState('');
  const [feeling, setFeeling] = useState('');
  const [mode, setMode] = useState<Mode>('CALM DOWN');
  const [language, setLanguage] = useState('Malayalam (Manglish requested)');

  // Chat state
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startSession = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionId = addSession({
      partnerName, duration, whoEnded, story, feeling, need: 'Support', mode, language
    });
    setActiveSessionId(sessionId);
    
    // Send initial greeting based on intake
    addMessage({
      sessionId,
      role: 'assistant',
      content: `Hi friend. Look, I heard what happened with ${partnerName}. It seriously sucks that you're feeling ${feeling} after ${duration} together. But honestly, my creator (the boss) built me because he went through a completely miserable heartbreak of his own... so I literally exist for this exact moment. Grab a seat, let's talk about it.`
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeSessionId) return;

    const userMessage = input;
    setInput('');
    setIsTyping(true);
    
    await addMessage({
      sessionId: activeSessionId,
      role: 'user',
      content: userMessage
    });

    setIsTyping(false);
  };

  const messages = activeSessionId ? getSessionMessages(activeSessionId) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeSessionId) {
    return (
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', maxWidth: '800px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel">
          <h2 className="text-center" style={{ marginBottom: '2rem' }}>Tell me a little about what happened.</h2>
          <form onSubmit={startSession} className="flex-col">
            <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Partner's Name</label>
                <input required className="input-field" value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="e.g. Alex" />
              </div>
              <div>
                <label>How long were you together?</label>
                <input required className="input-field" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 3 years" />
              </div>
            </div>

            <label className="mt-4">Who ended it?</label>
            <select className="input-field" value={whoEnded} onChange={e => setWhoEnded(e.target.value)}>
              <option>They ended it</option>
              <option>I ended it</option>
              <option>We mutually agreed</option>
              <option>It's complicated</option>
            </select>

            <label className="mt-4">What happened? (Just briefly)</label>
            <textarea required className="input-field" rows={3} value={story} onChange={e => setStory(e.target.value)} placeholder="We grew apart..."></textarea>

            <label className="mt-4">How are you feeling right now?</label>
            <input required className="input-field" value={feeling} onChange={e => setFeeling(e.target.value)} placeholder="Lost, confused, angry..." />

            <label className="mt-4">Preferred Language</label>
            <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="English">English</option>
              <option value="Malayalam (Manglish requested)">Malayalam (You can type in Manglish!)</option>
              <option value="Hindi">Hindi</option>
            </select>

            <label className="mt-4">What do you think you need most right now?</label>
            <select className="input-field" value={mode} onChange={e => setMode(e.target.value as Mode)}>
              <option value="CALM DOWN">To just calm down and feel safe</option>
              <option value="JUST VENT">To vent without advice</option>
              <option value="UNDERSTAND WHAT HAPPENED">To understand why this happened</option>
              <option value="MOVE ON">To take small steps to move on</option>
            </select>

            <button type="submit" className="btn mt-8" style={{ width: '100%' }}>Start Conversation</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>HeartMend</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)' }}>Current Mode: {mode}</span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Exit to Dashboard</button>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', background: msg.role === 'user' ? 'var(--surface-color)' : 'var(--accent-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {msg.role === 'user' ? <User size={16} /> : <Heart size={16} />}
                </div>
                <div style={{
                  background: msg.role === 'user' ? 'var(--surface-color)' : 'rgba(236,72,153,0.1)',
                  padding: '1rem',
                  borderRadius: '16px',
                  borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                  color: 'var(--text-primary)',
                  lineHeight: 1.5,
                  border: msg.role === 'assistant' ? '1px solid rgba(236,72,153,0.2)' : '1px solid var(--border-color)'
                }}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={16} />
                </div>
                <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(236,72,153,0.1)', color: 'var(--text-secondary)' }}>
                  HeartMend is carefully thinking...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <input 
            className="input-field" 
            style={{ margin: 0, flex: 1, borderRadius: '99px', padding: '1rem 1.5rem' }} 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Type your message here..."
            disabled={isTyping}
          />
          <button type="submit" disabled={isTyping || !input.trim()} className="btn" style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0, opacity: (!input.trim() || isTyping) ? 0.5 : 1 }}>
            <Send size={20} style={{ marginLeft: '-2px' }} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default HeartMendApp;
