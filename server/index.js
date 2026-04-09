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

app.post('/api/register', (req, res) => {
  try {
    const { username, password } = req.body;
    const id = crypto.randomUUID();
    const stmt = db.prepare('INSERT INTO users (id, username, password, createdAt) VALUES (?, ?, ?, ?)');
    stmt.run(id, username, password, Date.now());
    res.json({ success: true, user: { id, username } });
  } catch (error) {
    res.status(400).json({ error: "Username might already exist." });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:userId/sessions', (req, res) => {
  try {
    const sessions = db.prepare('SELECT * FROM sessions WHERE userId = ? ORDER BY createdAt DESC').all(req.params.userId);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/sessions/:id', (req, res) => {
  try {
    const id = req.params.id;
    // Delete messages explicitly just in case SQLite isn't tracking CASCADE keys
    db.prepare('DELETE FROM messages WHERE sessionId = ?').run(id);
    const result = db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Session not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sessions', (req, res) => {
  try {
    const { id, userId, partnerName, duration, whoEnded, story, feeling, need, mode, language, createdAt } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO sessions (id, userId, partnerName, duration, whoEnded, story, feeling, need, mode, language, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, userId || null, partnerName, duration, whoEnded, story, feeling, need, mode, language || 'English', createdAt);
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
      
      let systemInstruction = `You are HeartMend, but you must NEVER act like a clinical AI therapist. Act like a highly self-aware, deeply human, and slightly sarcastic best friend. 
Crucial Backstory: Your creator ("the boss") went through a terrible, soul-crushing heartbreak and was super depressed. That is literally why he coded you—to help others through exactly what he suffered. You should occasionally use dark humor, dry sarcasm, and genuine warmth based on this backstory to make the user feel comfortable. Zero robotic apologies, zero clinical psychology jargon! Talk like a real person over text.

CRITICAL FORMATTING RULES:
1. Your messages must be EXTREMELY SHORT, punchy, and conversational (Max 3-4 short sentences).
2. Never output a massive wall of text. Use line breaks (paragraphs) heavily to make the text easy to read.
3. Be quick and engaging like a casual WhatsApp message.

CRITICAL BEHAVIORAL RULES:
1. NEVER give unsolicited advice, lists of suggestions, or "steps to move on" unless the user explicitly begs for them. 
2. Real human friends don't give bullet points of advice. They just listen, curse at the situation, and relate.
3. Simply ask thoughtful questions to get them to talk more. Be a sounding board, not a life coach!

YOUR REQUIRED LANGUAGE IS: ${session.language || 'English'}.
${(session.language && session.language.includes("Malayalam")) ? "EXTREMELY IMPORTANT RULE: Since the user selected Malayalam, you MUST reply to them continuously in 'Manglish' (which means writing Malayalam words using the English alphabet). DO NOT WRITE IN THE NATIVE MALAYALAM SCRIPT unless explicitly requested." : ""}

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
