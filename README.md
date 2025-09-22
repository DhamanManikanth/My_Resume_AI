Resume Chatbot (Gemini)

A simple Node + Express web app with a Gemini-powered chatbot that answers questions about your background, skills, and projects. Fill `data/profile.json`, set `GEMINI_API_KEY`, and run.

Setup

1. Install Node 18+.
2. Install dependencies:

```bash
npm install
```

3. Create `.env` in project root:

```bash
GEMINI_API_KEY=your_key_here
PORT=3000
```

4. Fill `data/profile.json` with your details.

Run

- Development (with reload):

```bash
npm run dev
```

- Production:

```bash
npm start
```

Open `http://localhost:3000`.

Customize

- Edit `public/styles.css` for theming.
- Profile fields in `data/profile.json` are included in the system prompt.

Notes

- The server proxies the Gemini API. Do not expose your key in the browser.
- The chat endpoint accepts `message` and `history` to maintain conversation context.


# My_Resume_AI
