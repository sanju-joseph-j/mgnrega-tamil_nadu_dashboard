// src/api.js
export async function getDistricts() {
  const res = await fetch('/api/districts');
  return res.json();
}
export async function getDistrictSummary(name) {
  const res = await fetch(`/api/district/${encodeURIComponent(name)}/summary`);
  return res.json();
}
