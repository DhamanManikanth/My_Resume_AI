const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const suggestedEl = document.getElementById('suggested');

const nameEl = document.getElementById('name');
const nameFooterEl = document.getElementById('name-footer');
const titleEl = document.getElementById('title');
const aboutEl = document.getElementById('about');
const skillsEl = document.getElementById('skills');
const projectsEl = document.getElementById('projects');
const expEl = document.getElementById('experience');
const linksEl = document.getElementById('links');
const avatarEl = document.getElementById('avatar');
document.getElementById('year').textContent = new Date().getFullYear();

let history = [];

function addMessage(role, content) {
  const row = document.createElement('div');
  row.className = `msg ${role}`;
  const roleEl = document.createElement('div');
  roleEl.className = 'role';
  roleEl.textContent = role === 'user' ? 'You' : 'Assistant';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = content;
  row.appendChild(roleEl);
  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addTyping() {
  const row = document.createElement('div');
  row.className = 'msg assistant';
  const roleEl = document.createElement('div');
  roleEl.className = 'role';
  roleEl.textContent = 'Assistant';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = '<span class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';
  row.appendChild(roleEl);
  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return bubble;
}

async function fetchProfile() {
  const res = await fetch('/api/profile');
  if (!res.ok) return null;
  return res.json();
}

function renderProfile(p) {
  if (!p) return;
  nameEl.textContent = p.name || '';
  nameFooterEl.textContent = p.name || '';
  titleEl.textContent = p.title || '';
  aboutEl.textContent = p.about || '';
  avatarEl.src = p.avatar || 'https://api.dicebear.com/9.x/identicon/svg?seed=me';
  skillsEl.innerHTML = '';
  (p.skills || []).forEach(s => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = s;
    skillsEl.appendChild(chip);
  });
  expEl.innerHTML = '';
  (p.experience || []).forEach(e => {
    const item = document.createElement('div');
    item.style.marginBottom = '10px';
    item.innerHTML = `<strong>${e.role || ''}</strong> @ ${e.company || ''} <span style="color:#aab2d6">(${e.period || ''})</span><br>${e.summary || ''}`;
    expEl.appendChild(item);
  });
  // Projects
  projectsEl.innerHTML = '';
  (p.projects || []).forEach(pr => {
    const card = document.createElement('div');
    card.style.marginBottom = '12px';
    const title = pr.name ? `<strong>${pr.name}</strong>` : '';
    const desc = pr.description || '';
    const url = pr.url ? ` — <a href="${pr.url}" target="_blank" rel="noopener">Link</a>` : '';
    card.innerHTML = `${title}<br>${desc}${url}`;
    projectsEl.appendChild(card);
  });
  linksEl.innerHTML = '';
  const links = p.links || {};
  Object.keys(links).forEach(k => {
    const a = document.createElement('a');
    a.href = links[k];
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = k;
    linksEl.appendChild(a);
  });
}

async function sendMessage(text) {
  addMessage('user', text);
  history.push({ role: 'user', content: text });
  chatInput.value = '';
  const typingBubble = addTyping();
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history })
    });
    const data = await res.json();
    const reply = data.reply || data.error || 'No response';
    typingBubble.textContent = reply;
    history.push({ role: 'assistant', content: reply });
  } catch (e) {
    typingBubble.textContent = 'Error contacting server.';
  }
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (text) sendMessage(text);
});

(async function init() {
  const profile = await fetchProfile();
  renderProfile(profile);
  addMessage('assistant', 'Hi! I\'m your resume assistant. Ask me about projects, experience, or skills.');
  // Suggested questions
  if (profile && Array.isArray(profile.sampleQuestions)) {
    suggestedEl.innerHTML = '';
    profile.sampleQuestions.forEach(q => {
      const chip = document.createElement('button');
      chip.className = 'chip-button';
      chip.type = 'button';
      chip.textContent = q;
      chip.addEventListener('click', () => sendMessage(q));
      suggestedEl.appendChild(chip);
    });
  }
})();


