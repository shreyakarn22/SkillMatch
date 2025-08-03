const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const dbPath = path.join(__dirname, 'db.json');

// Helper to read db.json
function getDB() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { jobRoles: [], allSkills: [], submissions: [] };
  }
}
// Helper to write db.json
function saveDB(db) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

// GET /api/data - return jobRoles and allSkills
app.get('/api/data', (req, res) => {
  console.log('GET /api/data called');
  const db = getDB();
  res.json({ jobRoles: db.jobRoles, allSkills: db.allSkills });
});

// POST /api/analyze - analyze and save submission
app.post('/api/analyze', (req, res) => {
  const { name, email, jobRole, userSkills } = req.body;
  const db = getDB();
  const role = db.jobRoles.find(j => j.name === jobRole);
  if (!role) {
    return res.status(400).json({ error: 'Invalid job role' });
  }
  const requiredSkills = role.skills;
  const matchedSkills = userSkills.filter(skill => requiredSkills.includes(skill));
  const missingSkills = requiredSkills.filter(skill => !userSkills.includes(skill));
  const matchPercent = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  const report = {
    name,
    email,
    jobRole,
    matchPercent,
    matchedSkills,
    missingSkills,
    date: new Date().toISOString()
  };

  db.submissions = db.submissions || [];
  db.submissions.push(report);
  saveDB(db);

  res.json(report);
});


app.listen(PORT, () => {
  console.log(`SkillMatch backend running on http://localhost:${PORT}`);
});