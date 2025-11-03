// 🚀 MGNREGA Tamil Nadu Incremental Data Fetcher
// ==============================================

console.log("🌾 Starting incremental data fetch...");

const fetch = (...args) => import('node-fetch').then(m => m.default(...args));
const Database = require('better-sqlite3');
const path = require('path');

// === CONFIG ===
const API_KEY = '579b464db66ec23bdd0000013ce491abbf3a43d94d1baed4da9cfeb6';
const RESOURCE_ID = 'ee03643a-ee4c-48c2-ac30-9f2ff26ab722';
const STATE = 'TAMIL NADU';

// === DATABASE SETUP ===
const dbPath = path.join(__dirname, 'db.sqlite');
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS mgnrega (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_name TEXT,
  district_name TEXT,
  month TEXT,
  fin_year TEXT,
  raw_json TEXT
);
`);

const insert = db.prepare(`
INSERT INTO mgnrega (state_name, district_name, month, fin_year, raw_json)
VALUES (@state_name, @district_name, @month, @fin_year, @raw_json)
`);

// === HELPER FUNCTIONS ===
function getFinancialYear(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  if (month >= 4) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}

function getMonthsUpToNow() {
  const start = new Date(2024, 3); // April 2024
  const now = new Date();
  const months = [];
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  while (start <= now) {
    months.push({ name: names[start.getMonth()], year: start.getFullYear() });
    start.setMonth(start.getMonth() + 1);
  }
  return months;
}

// === MAIN EXECUTION ===
(async () => {
  const months = getMonthsUpToNow();
  console.log("🗓 Fetching for:", months.map(m => `${m.name} ${m.year}`).join(", "));

  for (const { name: month, year } of months) {
    const finYear = getFinancialYear(new Date(year, 3));
    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=1000&filters[state_name]=${encodeURIComponent(
      STATE
    )}&filters[fin_year]=${encodeURIComponent(finYear)}&filters[month]=${encodeURIComponent(month)}`;

    console.log(`📦 Fetching data for ${month} ${year} (${finYear})...`);

    try {
      const res = await fetch(url);
      const json = await res.json();

      if (!json.records || json.records.length === 0) {
        console.log(`⚠️ No data found for ${month} ${year}`);
        continue;
      }

      const tx = db.transaction((records) => {
        for (const r of records) {
          insert.run({
            state_name: r.state_name || STATE,
            district_name: r.district_name || "Unknown",
            month: r.month || month,
            fin_year: r.fin_year || finYear,
            raw_json: JSON.stringify(r),
          });
        }
      });

      tx(json.records);
      console.log(`✅ Stored ${json.records.length} records for ${month} ${year}`);
    } catch (err) {
      console.error(`❌ Error fetching ${month} ${year}:`, err.message);
    }
  }

  db.close();
  console.log("🎉 Done! Database updated up to the current month.");
})();
