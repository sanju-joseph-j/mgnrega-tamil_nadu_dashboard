// server/server.js
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
app.use(cors());
const db = new Database("./db.sqlite");

// ✅ Get unique districts
app.get("/api/districts", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT district_name FROM mgnrega ORDER BY district_name").all();
  res.json(rows.map(r => r.district_name));
});

// ✅ Get summary data for a district
app.get("/api/summary/:district", (req, res) => {
  const { district } = req.params;
  const rows = db.prepare(`
    SELECT 
      month,
      SUM(total_persondays) as total_persondays,
      SUM(works_completed) as works_completed,
      SUM(expenditure) as expenditure
    FROM mgnrega
    WHERE district_name = ?
    GROUP BY month
    ORDER BY month
  `).all(district);
  res.json(rows);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
