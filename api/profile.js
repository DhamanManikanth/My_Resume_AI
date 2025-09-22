const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const profilePath = path.join(process.cwd(), 'data', 'profile.json');
    const content = fs.readFileSync(profilePath, 'utf-8');
    const json = JSON.parse(content);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(json));
  } catch (e) {
    res.status(404).json({ error: 'Profile not found' });
  }
};


