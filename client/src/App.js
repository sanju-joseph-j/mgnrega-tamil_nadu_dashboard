import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [months] = useState([
    "Oct 2025", "Sep 2025", "Aug 2025", "Jul 2025", "Jun 2025",
    "May 2025", "Apr 2025", "Mar 2025", "Feb 2025", "Jan 2025",
    "Dec 2024", "Nov 2024", "Oct 2024", "Sep 2024", "Aug 2024",
    "Jul 2024", "Jun 2024", "May 2024", "Apr 2024"
  ]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Use environment variable for flexibility
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`${API_BASE}/api/districts`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch districts");
        return res.json();
      })
      .then(d => setDistricts(d.districts || []))
      .catch(err => {
        console.error("Error fetching districts:", err);
        setError("Unable to fetch districts. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [API_BASE]);

  const handleSearch = () => {
    if (!selectedDistrict || !selectedMonth) {
      alert("Please select district and month.");
      return;
    }

    const [month, year] = selectedMonth.split(" ");
    const finYear =
      parseInt(year) === 2025 && month !== "Jan" && month !== "Feb" && month !== "Mar"
        ? "2025-2026"
        : "2024-2025";

    setLoading(true);
    setError("");

    fetch(`${API_BASE}/api/district/${selectedDistrict}/${month}/${finYear}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then(setData)
      .catch(err => {
        console.error("Error fetching data:", err);
        setError("Unable to fetch data for the selected district/month.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="app-container">
      <h2>🌾 MGNREGA — Tamil Nadu Dashboard</h2>

      <div className="filters">
        <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}>
          <option value="">Select District</option>
          {districts.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          <option value="">Select Month</option>
          {months.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <button onClick={handleSearch}>🔍 Search</button>
      </div>

      {loading && <p style={{ textAlign: "center", color: "#0077cc" }}>Fetching data...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      {!loading && districts.length === 0 && !error && (
        <p style={{ textAlign: "center", color: "gray" }}>No districts found.</p>
      )}

      {data && (
        <div className="data-box">
          <h3>📍 {data.district_name} — {data.month} ({data.fin_year})</h3>
          <table>
            <tbody>
              {Object.entries(data).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
