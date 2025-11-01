// server/check_count.js
const Database = require('better-sqlite3');
const db = new Database('./db.sqlite');
const row = db.prepare('SELECT COUNT(*) AS c FROM mgnrega').get();
console.log('Total rows:', row.c);
db.close();
