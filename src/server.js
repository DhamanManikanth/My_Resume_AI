const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Load profile data
function loadProfile() {
  const profilePath = path.join(__dirname, '..', 'data', 'profile.json');
  try {
    const content = fs.readFileSync(profilePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

app.get('/api/profile', (req, res) => {
  const profile = loadProfile();
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found. Please fill data/profile.json' });
  }
  res.json(profile);
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing message' });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY in environment' });
    }

    const profile = loadProfile();
    const profileContext = profile ? `
You are an AI assistant acting as the personal resume chatbot for ${profile.name}. 
Use the following profile data to answer questions accurately and concisely. 
If a question is unrelated to ${profile.name}, politely steer back to the professional context.

PROFILE JSON:\n${JSON.stringify(profile, null, 2)}
` : 'You are a resume chatbot. The profile data is unavailable.';

    const genAI = new GoogleGenerativeAI(apiKey);
    // Choose a stable, widely available model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const historyMessages = Array.isArray(history) ? history : [];
    const formattedHistory = historyMessages
      .filter(h => h && typeof h.role === 'string' && typeof h.content === 'string')
      .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
      .join('\n');

    const prompt = `${profileContext}\n\nConversation so far:\n${formattedHistory}\n\nNew user message: ${message}\n\nRespond clearly. If asked for links, include only those in the profile unless the user requests otherwise.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error('Chat error', err);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


