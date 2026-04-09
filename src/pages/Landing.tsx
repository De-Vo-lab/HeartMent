import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Shield, Sparkles, MessageCircle, Quote } from 'lucide-react';

const QUOTES = [
  { 
    text: "All's fair in love and war.", 
    author: "Unknown", 
    img: "https://images.unsplash.com/photo-1518199266791-5375a8319d40?w=1200&q=80" 
  },
  { 
    text: "The emotion that can break your heart is sometimes the very one that heals it.", 
    author: "Nicholas Sparks", 
    img: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=1200&q=80" 
  },
  { 
    text: "Sometimes good things fall apart so better things can fall together.", 
    author: "Marilyn Monroe", 
    img: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&q=80" 
  },
  { 
    text: "You can't start the next chapter of your life if you keep re-reading the last one.", 
    author: "Michael McMillan", 
    img: "https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=1200&q=80" 
  }
];

const Landing = () => {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % QUOTES.length);
    }, 6000); // Shuffles every 6 seconds
    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  };

  return (
    <div className="container" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
      
      {/* Hero Split Layout */}
      <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6rem' }}>
        
        {/* Left Side: Copy & Actions */}
        <motion.div 
          style={{ flex: '1 1 500px' }}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-4">
            <div style={{ display: 'inline-flex', padding: '0.5rem 1rem', background: 'rgba(236,72,153,0.1)', color: 'var(--accent-color)', borderRadius: '99px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              <Sparkles size={16} className="mr-2" style={{ marginRight: '8px' }} />
              Your compassionate AI companion
            </div>
          </motion.div>
          
          <motion.h1 variants={itemVariants} style={{ fontSize: '3.5rem', lineHeight: 1.2, textAlign: 'left', marginBottom: '1.5rem' }}>
            Healing happens one<br />message at a time.
          </motion.h1>
          
          <motion.p variants={itemVariants} style={{ fontSize: '1.25rem', textAlign: 'left', marginBottom: '3rem', maxWidth: '500px' }}>
            HeartMend is a deeply empathetic and non-judgmental space designed to help you navigate heartbreak, find clarity, and slowly rediscover your joy.
          </motion.p>
          
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/app')} className="btn" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              <Heart size={20} />
              Start Your Journey
            </button>
            <button onClick={() => navigate('/admin')} className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              <Shield size={20} />
              Psychiatrist Login
            </button>
          </motion.div>
        </motion.div>

        {/* Right Side: Photo Carousel Grid */}
        <motion.div 
          style={{ flex: '1 1 400px', height: '500px', position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', background: 'var(--surface-color)' }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `url(${QUOTES[currentIdx].img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Dark Gradient Overlay for text legibility */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(15,15,25,0.95) 0%, rgba(15,15,25,0.4) 50%, rgba(15,15,25,0.1) 100%)' }} />
              
              {/* Quote Content overlay */}
              <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', zIndex: 2 }}>
                <Quote color="var(--accent-color)" size={32} style={{ marginBottom: '1rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.5rem', lineHeight: '1.4', margin: '0 0 1rem 0', color: '#fff', fontStyle: 'italic' }}>
                  "{QUOTES[currentIdx].text}"
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                  — {QUOTES[currentIdx].author}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

      </div>

      {/* Feature Cards below */}
      <motion.div 
        className="flex" 
        style={{ gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <FeatureCard 
          icon={<Heart color="var(--accent-color)" size={32} />}
          title="Safe Space to Vent"
          description="Speak your mind without fear of judgment. Whatever you're feeling is valid and welcome here."
        />
        <FeatureCard 
          icon={<MessageCircle color="var(--accent-color)" size={32} />}
          title="Guided Recovery"
          description="A tailored experience that adapts to your needs—whether you need to vent, understand what happened, or move on."
        />
        <FeatureCard 
          icon={<Shield color="var(--accent-color)" size={32} />}
          title="Professionally Supervised"
          description="Your conversations are completely private, but our AI interactions are reviewed by therapists to ensure safety."
        />
      </motion.div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="glass-panel" style={{ flex: '1 1 300px', maxWidth: '350px' }}>
      <div style={{ marginBottom: '1.5rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ fontSize: '0.95rem' }}>{description}</p>
    </div>
  );
};

export default Landing;
