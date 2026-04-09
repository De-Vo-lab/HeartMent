import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSessions } from '../store/SessionStore';
import { Heart } from 'lucide-react';

const Auth = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setCurrentUser } = useSessions();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      setError('Please use a pseudonym of at least 3 characters.');
      return;
    }
    
    // Stateless Login: we just set local storage context!
    const user = { username: username.trim(), id: crypto.randomUUID() };
    setCurrentUser(user);
    navigate('/dashboard');
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '3rem 2rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Heart size={40} color="var(--accent-color)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ margin: '0 0 0.5rem 0' }}>Join HeartMend</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Create a secure pseudonym for your private space.</p>
        </div>

        {error && <p style={{ color: '#ff4444', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input 
            required 
            className="input-field" 
            placeholder="Choose a Pseudonym (e.g. Alex123)" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <button type="submit" className="btn" style={{ width: '100%' }}>
            Access My Secure Space
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Auth;
