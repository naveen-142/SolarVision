import { useEffect, useState } from "react";
import "./dashboard.css";
import RazorpayButton from "../components/RazorpayButton";

// 🔥 AUTH CONTEXT
import { useAuth } from "../AuthContext";

export default function Dashboard() {
  const [data, setData] = useState(null);

  // 🔥 GET LOGGED-IN USER
  const { currentUser } = useAuth();

  useEffect(() => {
    // 🔐 SAFETY CHECK
    if (!currentUser) return;

    console.log("Current user:", currentUser);

    // ✅ CORRECT API (EXISTS IN BACKEND)
    fetch(
      `http://127.0.0.1:8000/dashboard/user/stats/?user_id=${currentUser.uid}`
    )
      .then((res) => res.json())
      .then((json) => {
        console.log("Dashboard data:", json);
        setData(json);
      })
      .catch((err) => console.error("Dashboard fetch error:", err));
  }, [currentUser]);

  if (!data) {
    return (
      <h2 style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
        Loading Dashboard...
      </h2>
    );
  }

  // 🔥 GET NEW DATA
  const { kpis, history } = data; // use new structure

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">⚡ Energy Performance Dashboard</h1>

      {/* ---------------- SUBSCRIPTION STATUS CARD ---------------- */}
      <div className="section" style={{ background: "linear-gradient(135deg, #1e1e2e 0%, #2a2a40 100%)", padding: "2rem", borderRadius: "15px", border: "1px solid #444", marginBottom: "30px", marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>

          {/* Left: Status Text */}
          <div>
            <h2 style={{ color: "white", marginBottom: "10px" }}>
              Current Plan: <span style={{ color: kpis.is_premium ? "#00ff88" : "#ffcc00", fontWeight: "bold" }}>
                {kpis.is_premium ? "PREMIUM 💎" : "FREE TIER"}
              </span>
            </h2>

            {!kpis.is_premium && (
              <p style={{ color: "#aaa", fontSize: "1.1rem" }}>
                You have used <b>{kpis.upload_count}</b> / {kpis.max_free_limit} free trials.
              </p>
            )}
            {kpis.is_premium && (
              <p style={{ color: "#aaa", fontSize: "1.1rem" }}>
                You have <b>Unlimited Access</b> to all features.
              </p>
            )}
          </div>

          {/* Middle: Progress Bar (Only for Free) */}
          {!kpis.is_premium && (
            <div style={{ flex: 1, maxWidth: "400px", minWidth: "250px" }}>
              <div style={{ background: "#444", borderRadius: "10px", height: "12px", overflow: "hidden", position: "relative" }}>
                <div style={{
                  width: `${Math.min((kpis.upload_count / kpis.max_free_limit) * 100, 100)}%`,
                  background: kpis.upload_count >= kpis.max_free_limit ? "#ff4444" : "#00bcd4",
                  height: "100%", transition: "width 0.5s ease"
                }}></div>
              </div>
              <small style={{ color: "#888", marginTop: "5px", display: "block", textAlign: "right" }}>
                {kpis.max_free_limit - kpis.upload_count} trials remaining
              </small>
            </div>
          )}

          {/* Right: Upgrade Button (Only for Free) */}
          {!kpis.is_premium && (
            <div style={{ width: "fit-content" }}>
              <RazorpayButton /> {/* Reusing the button component */}
            </div>
          )}
        </div>
      </div>


      {/* KPI SECTION */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>{kpis.total_images}</h3>
          <p>Total Uploads</p>
        </div>

        <div className="kpi-card">
          <h3>{kpis.total_yolo_outputs}</h3>
          <p>Analyses Run</p>
        </div>

        <div className="kpi-card">
          <h3>{kpis.total_panels_detected}</h3>
          <p>Panels Detected</p>
        </div>

        <div className="kpi-card">
          <h3>{kpis.total_daily_loss_kwh} kWh</h3>
          <p>Total Energy Potential Lost</p>
        </div>
      </div>


      {/* ---------------- ANALYSIS HISTORY TABLE ---------------- */}
      <div className="section">
        <h2>📜 Analysis History</h2>

        <div className="timeseries-table">
          <table style={{ width: "100%", borderCollapse: "collapse", color: "#eee" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #444", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Date</th>
                <th style={{ padding: "12px" }}>Report ID</th>
                <th style={{ padding: "12px" }}>Panels</th>
                <th style={{ padding: "12px" }}>Loss (kWh)</th>
                <th style={{ padding: "12px" }}>Image</th>
                <th style={{ padding: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {history && history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #333" }}>
                    <td style={{ padding: "12px", color: "#aaa" }}>{item.date}</td>
                    <td style={{ padding: "12px" }}>{item.download_token.substring(0, 8)}...</td>
                    <td style={{ padding: "12px" }}>{item.panels}</td>
                    <td style={{ padding: "12px", color: "#ff6b6b" }}>-{item.loss_kwh} kWh</td>
                    <td style={{ padding: "12px" }}>
                      {item.image_url && (
                        <a href={`http://127.0.0.1:8000${item.image_url}`} target="_blank" rel="noreferrer" style={{ color: "#00bcd4" }}>View</a>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ background: "#2ecc71", color: "#000", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>Completed</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#777" }}>
                    No analysis history found. Upload an image to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
