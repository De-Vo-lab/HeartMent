import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSessions } from '../store/SessionStore';
import { Heart, MessageCircle, LogOut, Trash2 } from 'lucide-react';

const UserDashboard = () => {
  const { currentUser, sessions, setCurrentUser, deleteSession } = useSessions();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('heartmend_user');
    setCurrentUser(null);
    navigate('/');
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container" style={{ padding: '4rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <h1 style={{ margin: 0 }}>Welcome, {currentUser.username}</h1>
        <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* New Session Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel" 
          style={{ cursor: 'pointer', border: '2px dashed var(--accent-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}
          onClick={() => navigate('/app')}
        >
          <Heart size={48} color="var(--accent-color)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: 0, textAlign: 'center' }}>Start New Session</h3>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.5rem' }}>Begin a new conversation about someone or something else.</p>
        </motion.div>

        {/* Past Sessions */}
        {sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel"
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            onClick={() => navigate(`/app?session=${session.id}`)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ background: 'rgba(236,72,153,0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                <MessageCircle size={24} color="var(--accent-color)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {new Date(session.createdAt).toLocaleDateString()}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                  title="Delete Session Forever"
                >
                  <Trash2 size={16} color="#ff3333" />
                </button>
              </div>
            </div>
            <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>{session.partnerName}</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', background: 'var(--surface-color)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                {session.duration}
              </span>
              <span style={{ fontSize: '0.75rem', background: 'var(--surface-color)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                {session.mode}
              </span>
            </div>
          </motion.div>
        ))}

      </div>
    </div>
  );
};

export default UserDashboard;
