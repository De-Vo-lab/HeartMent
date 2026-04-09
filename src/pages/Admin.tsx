import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ExternalLink, LogOut, CheckCircle } from 'lucide-react';

const Admin = () => {
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
      <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '3rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Shield size={48} color="var(--accent-color)" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ margin: 0 }}>Psychiatrist Access</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Secure portal for clinical log monitoring.</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
               className="input-field" 
               placeholder="Admin Username" 
               value={usernameInput}
               onChange={e => setUsernameInput(e.target.value)}
            />
            <input 
               type="password" 
               className="input-field" 
               placeholder="Admin Password" 
               value={passwordInput}
               onChange={e => setPasswordInput(e.target.value)}
            />
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Enter Dashboard</button>
            <button type="button" onClick={() => navigate('/')} className="btn-secondary" style={{ width: '100%' }}>Back to App</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div>
           <h1 style={{ margin: 0 }}>Clinical Workspace</h1>
           <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Authenticated as <span style={{ color: 'var(--accent-color)' }}>Drax (Head Psychiatrist)</span></p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Main Database Link */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
             <div style={{ background: 'rgba(236,72,153,0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                <ExternalLink size={24} color="var(--accent-color)" />
             </div>
             <h2 style={{ margin: 0 }}>Patient Log Database</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            All patient conversations are automatically logged in real-time to your secure Google Sheet. 
            Use this database to review transcripts, monitor patient progress, and plan clinical interventions.
          </p>
          <a 
            href="https://docs.google.com/spreadsheets/d/e/2PACX-1vTQ4xOh5a-57777jwwGJTDHYrCLAvEx9xisg7bWAkT8gmx0eMLA5jxNaJJ7fWyGyWrKoSQR-cjHUA8o/pubhtml" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn"
            style={{ width: '100%', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
          >
            Access Live Spreadsheets
          </a>
        </motion.div>

        {/* System Health */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel" style={{ padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>System Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981' }}>
                <CheckCircle size={18} /> <span>Vercel Backend: Active</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981' }}>
                <CheckCircle size={18} /> <span>Google Webhook: Connected</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981' }}>
                <CheckCircle size={18} /> <span>AI Engine: Gemini Flash</span>
             </div>
          </div>
          <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)', opacity: 0.3 }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
             To disconnect the sheet, simply remove the <code>SHEETS_WEBHOOK_URL</code> from environment variables.
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default Admin;
