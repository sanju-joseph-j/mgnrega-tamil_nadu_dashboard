const fetch = (...args) => import('node-fetch').then(m => m.default(...args));

const url = "https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722?api-key=579b464db66ec23bdd0000013ce491abbf3a43d94d1baed4da9cfeb6&format=json&limit=1&filters%5Bstate_name%5D=TAMIL%20NADU&filters%5Bfin_year%5D=2024-2025";

(async () => {
  const res = await fetch(url);
  const data = await res.json();
  if (!data.records || data.records.length === 0) {
    console.log("❌ No records found");
    return;
  }
  const record = data.records[0];
  console.log("✅ Available fields:", Object.keys(record));
  console.log("🔹 Example record:", record);
})();
