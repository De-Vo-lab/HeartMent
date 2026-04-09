import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import db from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/api/sessions', (req, res) => {
  try {
    const sessions = db.prepare('SELECT * FROM sessions ORDER BY createdAt DESC').all();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sessions', (req, res) => {
  try {
    const { id, partnerName, duration, whoEnded, story, feeling, need, mode, createdAt } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO sessions (id, partnerName, duration, whoEnded, story, feeling, need, mode, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, partnerName, duration, whoEnded, story, feeling, need, mode, createdAt);
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions/:id/messages', (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM messages WHERE sessionId = ? ORDER BY timestamp ASC').all(req.params.id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { sessionId, role, content, timestamp, id } = req.body;
    
    const stmt = db.prepare('INSERT INTO messages (id, sessionId, role, content, timestamp) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, sessionId, role, content, timestamp);

    if (role === 'user') {
      const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
      const history = db.prepare('SELECT * FROM messages WHERE sessionId = ? ORDER BY timestamp ASC').all(sessionId);
      
      let systemInstruction = `You are HeartMend, a compassionate AI therapist...
About the person you're speaking with:
Partner: ${session.partnerName}
Duration: ${session.duration}
Who ended it: ${session.whoEnded}
Story: ${session.story}
Feeling right now: ${session.feeling}

Your current mode is: ${session.mode}`;

      if (session.mode === 'CALM DOWN') {
        systemInstruction += '\nYour only goal right now is to make this person feel safe. Validate their pain.';
      } else if (session.mode === 'UNDERSTAND WHAT HAPPENED') {
        systemInstruction += '\nHelp them make sense of the breakup with honesty and kindness.';
      } else if (session.mode === 'MOVE ON') {
        systemInstruction += '\nGive them warm, actionable advice for moving forward today.';
      } else if (session.mode === 'JUST VENT') {
        systemInstruction += '\nDo NOT give advice. Your only job is to listen and reflect. Show deep empathy.';
      }

      const contents = history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      let aiResponseText = '...';
      if (process.env.GEMINI_API_KEY) {
        try {
          const response = await ai.models.generateContent({
             model: 'gemini-flash-lite-latest',
             contents: contents,
             config: { systemInstruction: { role: "user", parts: [{text: systemInstruction}] } }
          });
          aiResponseText = response.text || "I'm here for you.";
        } catch (e) {
          console.error("Gemini Error: ", e);
          aiResponseText = "I hear you, and it's okay to feel this way. I'm having a little trouble connecting right now, but please take a deep breath. 🌿";
        }
      } else {
        aiResponseText = 'No GEMINI_API_KEY found in .env!';
      }

      const aiMessageId = crypto.randomUUID();
      stmt.run(aiMessageId, sessionId, 'assistant', aiResponseText, Date.now());

      res.json({ id: aiMessageId, sessionId, role: 'assistant', content: aiResponseText, timestamp: Date.now() });
    } else {
       res.json({ success: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
