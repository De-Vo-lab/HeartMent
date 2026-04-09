import type { SessionData, Message } from '../types';

const MOCK_DELAY = 1500;

export async function generateAIResponse(
  session: SessionData,
  history: Message[],
  apiKey?: string
): Promise<string> {
  // If no API key is provided, use mocked generic empathetic responses depending on the mode.
  // In a real implementation, we would call the Gemini API here.
  
  return new Promise((resolve) => {
    setTimeout(() => {
      if (session.mode === 'CALM DOWN') {
        resolve(`I hear you. The pain you are feeling right now is completely overwhelming, but you are safe. Take a slow, deep breath. Missing ${session.partnerName} is normal, but what you are feeling will not last forever. I am here with you. What is one small, gentle thing you can do for yourself in the next hour? 🌸`);
      } else if (session.mode === 'JUST VENT') {
        resolve(`That makes so much sense. I'm just sitting here listening to you. It's completely unfair and it hurts. Tell me more about what's going through your mind right now. 🌿`);
      } else if (session.mode === 'MOVE ON') {
        resolve(`You've been incredibly strong. Today is about taking the very first small step forward. Let's focus on doing something just for you, completely separate from ${session.partnerName}. Have you drank any water today or stepped outside? 💛`);
      } else {
        // UNDERSTAND WHAT HAPPENED
        resolve(`It’s really painful to look back at the patterns. From what you told me about how it ended, it sounds like there was miscommunication that built up over time. It wasn't your fault alone. Let's try to gently reflect. What were the signs you noticed before it completely fell apart?`);
      }
    }, MOCK_DELAY);
  });
}
