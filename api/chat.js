const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY in environment' });
    }
    const { message, history } = req.body || {};
    if (!message) return res.status(400).json({ error: 'Missing message' });

    const profilePath = path.join(process.cwd(), 'data', 'profile.json');
    const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));

    const profileContext = `You are an AI assistant acting as the personal resume chatbot for ${profile.name}. Use the following profile data to answer questions accurately and concisely. If a question is unrelated to ${profile.name}, politely steer back to the professional context.\n\nPROFILE JSON:\n${JSON.stringify(profile, null, 2)}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const historyMessages = Array.isArray(history) ? history : [];
    const formattedHistory = historyMessages
      .filter(h => h && typeof h.role === 'string' && typeof h.content === 'string')
      .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
      .join('\n');

    const prompt = `${profileContext}\n\nConversation so far:\n${formattedHistory}\n\nNew user message: ${message}\n\nRespond clearly. If asked for links, include only those in the profile unless requested otherwise.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.status(200).json({ reply: text });
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate response' });
  }
};


