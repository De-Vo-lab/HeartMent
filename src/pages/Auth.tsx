import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSessions } from '../store/SessionStore';
import { Heart, UserPlus, LogIn } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { setCurrentUser } = useSessions();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem('heartmend_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (e) {
      setError('Network error connecting to backend.');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '2rem 1rem', justifyContent: 'center', alignItems: 'center' }}>
      <motion.div 
        className="glass-panel" 
        style={{ width: '100%', maxWidth: '400px' }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <Heart size={48} color="var(--accent-color)" />
        </div>
        
        <h2 className="text-center" style={{ marginBottom: '0.5rem' }}>
          {isLogin ? 'Welcome Back' : 'Join HeartMend'}
        </h2>
        <p className="text-center" style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {isLogin ? 'Log in to continue your healing journey.' : 'Create a private space just for you.'}
        </p>

        {error && (
          <div style={{ background: 'rgba(255, 60, 60, 0.1)', color: '#ff6b6b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col">
          <input 
             type="text" 
             required 
             className="input-field" 
             placeholder="Username..." 
             value={username}
             onChange={e => setUsername(e.target.value)}
          />
          <input 
             type="password" 
             required 
             className="input-field mt-4" 
             placeholder="Password..." 
             value={password}
             onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="btn mt-6" style={{ width: '100%' }}>
            {isLogin ? <><LogIn size={18} /> Login</> : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <div className="text-center mt-6">
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? 'Need an account? Register here.' : 'Already have an account? Log in.'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
