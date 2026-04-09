import React, { useState } from 'react';
import { useSessions } from '../store/SessionStore';
import { User, Heart, ShieldAlert, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { sessions, getSessionMessages } = useSessions();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === 'drax' && passwordInput === 'drax@123###') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect credentials');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '2rem 1rem', justifyContent: 'center', alignItems: 'center' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>Psychiatrist Login</h2>
          <form onSubmit={handleLogin} className="flex-col">
            <input 
               type="text" 
               required 
               className="input-field" 
               placeholder="Username..." 
               value={usernameInput}
               onChange={e => setUsernameInput(e.target.value)}
            />
            <input 
               type="password" 
               required 
               className="input-field mt-4" 
               placeholder="Password..." 
               value={passwordInput}
               onChange={e => setPasswordInput(e.target.value)}
            />
            <button type="submit" className="btn mt-4" style={{ width: '100%' }}>Login</button>
            <button type="button" onClick={() => navigate('/')} className="btn-secondary mt-4" style={{ width: '100%' }}>Back to User App</button>
          </form>
        </div>
      </div>
    );
  }

  const filteredSessions = sessions.filter(
    s => s.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         s.story.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Psychiatrist Dashboard</h2>
        <button onClick={() => navigate('/')} className="btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>
          <ArrowLeft size={16} /> Back User Site
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: 0 }}>
        {/* Sidebar - Sessions List */}
        <div className="glass-panel" style={{ width: '350px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem', marginBottom: '1rem' }}>
            <Search size={16} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search by name or story..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', marginLeft: '0.5rem' }}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredSessions.length === 0 ? (
              <p className="text-center mt-4">No sessions found.</p>
            ) : (
              filteredSessions.map(session => (
                <div 
                  key={session.id} 
                  onClick={() => setSelectedSession(session.id)}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: selectedSession === session.id ? 'var(--accent-color)' : 'var(--border-color)',
                    background: selectedSession === session.id ? 'rgba(236,72,153,0.1)' : 'var(--surface-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>{session.partnerName} & User</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Mode: <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{session.mode}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {session.story}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Area - Session Details & Chat Log */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          {selectedSession ? (() => {
            const session = sessions.find(s => s.id === selectedSession);
            const messages = getSessionMessages(selectedSession);
            if (!session) return null;

            return (
              <>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
                  <h3 style={{ margin: '0 0 1rem 0' }}>Intake Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                    <div><strong>Partner:</strong> {session.partnerName}</div>
                    <div><strong>Duration:</strong> {session.duration}</div>
                    <div><strong>Ended By:</strong> {session.whoEnded}</div>
                    <div><strong>Feeling:</strong> {session.feeling}</div>
                    <div style={{ gridColumn: '1 / -1' }}><strong>Story:</strong> {session.story}</div>
                  </div>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ margin: 0, opacity: 0.8 }}>Chat Transcript</h4>
                  {messages.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No messages in this session yet.</p>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} style={{ display: 'flex', gap: '1rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                         <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', background: msg.role === 'user' ? 'var(--surface-color)' : 'rgba(236,72,153,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            {msg.role === 'user' ? <User size={16} /> : <Heart size={16} color="var(--accent-color)" />}
                          </div>
                          <div style={{ flex: 1, background: msg.role === 'user' ? 'transparent' : 'rgba(236,72,153,0.05)', borderRadius: '8px', padding: '1rem', border: msg.role === 'assistant' ? '1px solid rgba(236,72,153,0.2)' : '1px solid var(--border-color)', position: 'relative' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                              {msg.role === 'user' ? 'User' : 'HeartMend AI'}
                            </div>
                            <div style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>
                              {msg.content}
                            </div>
                            {msg.role === 'assistant' && (
                              <button style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Flag Response">
                                <ShieldAlert size={16} />
                              </button>
                            )}
                          </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            );
          })() : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: '1rem' }}>
              <ShieldAlert size={48} opacity={0.5} />
              <p>Select a session from the left to view the transcript</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
