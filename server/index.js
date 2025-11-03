// server/index.js
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const app = express();
const db = new Database('./db.sqlite');

// ✅ CORS setup — allows localhost (for dev) + deployed frontend (for production)
app.use(
  cors({
    origin: [
      'http://localhost:3000', // local React
      'https://mgnrega-tamilnadudashboard.vercel.app/' //vercel url
  })
);

app.use(express.json());

// ✅ Serve frontend if using single root deployment (optional)
app.use(express.static(path.join(__dirname, '../client/build')));

// Get all districts
app.get('/api/districts', (req, res) => {
  const rows = db
    .prepare(`SELECT DISTINCT district_name FROM mgnrega ORDER BY district_name`)
    .all();
  res.json({ districts: rows.map(r => r.district_name) });
});

// Get all months for a district
app.get('/api/district/:name/months', (req, res) => {
  const name = req.params.name;
  const rows = db
    .prepare(`SELECT DISTINCT month FROM mgnrega WHERE district_name = ? ORDER BY month`)
    .all(name);
  res.json({ months: rows.map(r => r.month) });
});

// Get full record for district + month + year
app.get('/api/district/:name/:month/:year', (req, res) => {
  const { name, month, year } = req.params;
  const row = db
    .prepare(`SELECT raw_json FROM mgnrega WHERE district_name = ? AND month = ? AND fin_year = ?`)
    .get(name, month, year);

  if (!row) return res.status(404).json({ error: 'Record not found' });

  const data = JSON.parse(row.raw_json);
  res.json(data);
});





const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API server running on port ${PORT}`));
