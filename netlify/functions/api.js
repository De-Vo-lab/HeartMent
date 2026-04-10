import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json());

// Note: Netlify provides environment variables via process.env automatically
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

app.post('/api/messages', async (req, res) => {
  try {
    const { session, history } = req.body;
    
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
         // Using the exact syntax that worked locally
         const response = await ai.models.generateContent({
             model: 'gemini-flash-lite-latest',
             contents: contents,
             config: { systemInstruction: { role: "user", parts: [{text: systemInstruction}] } }
         });
         aiResponseText = response.text || "I'm here for you.";
      } catch (e) {
         console.error("Gemini Error:", e);
         aiResponseText = "I hear you, and it's okay to feel this way. Please take a deep breath.";
      }
    } else {
       aiResponseText = 'No GEMINI_API_KEY backend variable configured on the host server!';
    }

    const aiResponse = { id: crypto.randomUUID(), sessionId: session.id, role: 'assistant', content: aiResponseText, timestamp: Date.now() };
    res.json(aiResponse);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/log', async (req, res) => {
  const webhookUrl = process.env.SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return res.status(500).json({ error: 'No webhook URL configured' });

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const text = await response.text();
    res.json({ ok: true, result: text });
  } catch (err) {
    console.error('Sheet Bridge Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export const handler = serverless(app);
