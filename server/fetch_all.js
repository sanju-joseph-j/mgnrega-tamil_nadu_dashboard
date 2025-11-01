// server/fetch_all.js
const fetch = (...args) => import('node-fetch').then(m => m.default(...args));
const Database = require('better-sqlite3');

const API_KEY = '579b464db66ec23bdd0000013ce491abbf3a43d94d1baed4da9cfeb6';
const RESOURCE_ID = 'ee03643a-ee4c-48c2-ac30-9f2ff26ab722';
const STATE = 'TAMIL NADU';
const FIN_YEAR = '2024-2025';

const db = new Database('./db.sqlite');

// Drop old table (optional, to reset schema)
db.exec(`DROP TABLE IF EXISTS mgnrega;`);

// Create a new detailed table
db.exec(`
CREATE TABLE IF NOT EXISTS mgnrega (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fin_year TEXT,
  month TEXT,
  state_name TEXT,
  district_name TEXT,
  raw_json TEXT
);
`);

const insert = db.prepare(`
INSERT INTO mgnrega (fin_year, month, state_name, district_name, raw_json)
VALUES (@fin_year, @month, @state_name, @district_name, @raw_json)
`);

(async () => {
  const limit = 1000;
  let offset = 0;
  let totalFetched = 0;

  while (true) {
    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=${limit}&offset=${offset}&filters[state_name]=${encodeURIComponent(STATE)}&filters[fin_year]=${encodeURIComponent(FIN_YEAR)}`;
    console.log(`Fetching offset=${offset}...`);

    const res = await fetch(url);
    const json = await res.json();

    if (!json.records || json.records.length === 0) {
      console.log("No more records. Stopping.");
      break;
    }

    const tx = db.transaction((recs) => {
      for (const r of recs) {
        insert.run({
          fin_year: r.fin_year || FIN_YEAR,
          month: r.month || '',
          state_name: r.state_name || '',
          district_name: r.district_name || 'Unknown',
          raw_json: JSON.stringify(r)
        });
      }
    });

    tx(json.records);
    totalFetched += json.records.length;
    console.log(`Fetched ${json.records.length} | Total so far: ${totalFetched}`);

    if (json.records.length < limit) break;
    offset += limit;
  }

  console.log(`✅ DONE. Total records fetched: ${totalFetched}`);
  db.close();
})();
