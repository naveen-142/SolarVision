import React, { useEffect, useState, useMemo } from "react";
import "../styles/adminDashboard.css";
import "../styles/adminLayout.css";

import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

import { Line, Pie, Bar, Radar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  BarElement,
  RadialLinearScale,
} from "chart.js";

ChartJS.register(
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  BarElement,
  RadialLinearScale
);

/* ------------------ ANIMATED NUMBER HOOK ------------------ */
function useAnimatedNumber(value, duration = 800) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = performance.now();
    let from = display;
    let to = value;

    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const current = from + (to - from) * progress;
      setDisplay(Number(current.toFixed(2)));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  return display;
}

export default function AdminDashboard() {
  /* ---------- ALL HOOKS MUST ALWAYS RUN ---------- */
  const [data, setData] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard/stats/")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);

  /* ---------- APPLY THEME ---------- */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  /* ---------- ENSURE HOOK ORDER DOES NOT CHANGE ---------- */
  const loading = !data;

  const { kpis, loss_breakdown, timeseries, panels } = data || {
    kpis: { total_images: 0, total_yolo_outputs: 0, total_panels_detected: 0, total_daily_loss_kwh: 0 },
    loss_breakdown: {},
    timeseries: [],
    panels: [],
  };

  /* ---------- FIXED ANIMATED NUMBERS (Always run) ---------- */
  const animatedImages = useAnimatedNumber(kpis.total_images);
  const animatedYolo = useAnimatedNumber(kpis.total_yolo_outputs);
  const animatedPanels = useAnimatedNumber(kpis.total_panels_detected);
  const animatedLoss = useAnimatedNumber(kpis.total_daily_loss_kwh);

  /* ---------- SIDEBAR CONFIG ---------- */
  const sidebarItems = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
      { key: "uploads", label: "Uploads", href: "/admin/uploads", icon: "🖼️" },
      { key: "faults", label: "Fault Reports", href: "/admin/faults", icon: "🚨" },
      { key: "panels", label: "Panels", href: "/admin/panels", icon: "🔧" },
    ],
    []
  );

  /* ---------- SEARCH FILTER ---------- */
  const filteredPanels = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return panels;
    return panels.filter(
      (p) =>
        p.panel_number.toString().includes(q) ||
        p.image_signature.toLowerCase().includes(q)
    );
  }, [search, panels]);

  /* ---------- CHART DATA ---------- */
  const lineChart = {
    labels: timeseries.map((t) => t.date),
    datasets: [
      {
        label: "Energy (kWh)",
        data: timeseries.map((t) => t.energy),
        borderColor: "#27ae60",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Loss (kWh)",
        data: timeseries.map((t) => t.loss),
        borderColor: "#e74c3c",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const pieChart = {
    labels: Object.keys(loss_breakdown),
    datasets: [
      {
        data: Object.values(loss_breakdown),
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#9b59b6", "#2ecc71"],
      },
    ],
  };

  const barChart = {
    labels: timeseries.map((t) => t.date),
    datasets: [
      {
        label: "Loss (kWh)",
        data: timeseries.map((t) => t.loss),
        backgroundColor: "#e67e22",
      },
    ],
  };

  const radarChart = {
    labels: Object.keys(loss_breakdown),
    datasets: [
      {
        label: "Fault Impact",
        data: Object.values(loss_breakdown),
        backgroundColor: "rgba(46,204,113,0.2)",
        borderColor: "#2ecc71",
      },
    ],
  };

  /* ---------- SHOW LOADING ---------- */
  if (loading) return <div className="loading">Loading Admin Dashboard…</div>;

  /* ---------- UI LAYOUT ---------- */
  return (
    <div className={`admin-layout ${theme}`}>
      <AdminSidebar items={sidebarItems} collapsed={sidebarCollapsed} />

      <div className="admin-main">
        <AdminHeader
          theme={theme}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
          searchValue={search}
          setSearchValue={setSearch}
        />

        <div className="admin-content">
          {/* KPI ROW */}
          <div className="admin-kpi-grid">
            <div className="admin-kpi-card">
              <h3>{animatedImages}</h3>
              <p>Total Uploaded Images</p>
            </div>

            <div className="admin-kpi-card">
              <h3>{animatedYolo}</h3>
              <p>Total YOLO Analyses</p>
            </div>

            <div className="admin-kpi-card">
              <h3>{animatedPanels}</h3>
              <p>Total Panels Detected</p>
            </div>

            <div className="admin-kpi-card">
              <h3>{animatedLoss} kWh</h3>
              <p>Energy Loss Today</p>
            </div>
          </div>

          {/* TABS */}
          <div className="admin-tabs">
            <button onClick={() => setActiveTab("overview")} className={activeTab === "overview" ? "active" : ""}>Overview</button>
            <button onClick={() => setActiveTab("uploads")} className={activeTab === "uploads" ? "active" : ""}>Uploads</button>
            <button onClick={() => setActiveTab("faults")} className={activeTab === "faults" ? "active" : ""}>Faults</button>
            <button onClick={() => setActiveTab("panels")} className={activeTab === "panels" ? "active" : ""}>Panels</button>
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <>
              <div className="chart-grid">
                <div className="chart-card">
                  <h2>Fault Breakdown</h2>
                  <Pie data={pieChart} />
                </div>

                <div className="chart-card">
                  <h2>Energy vs Loss</h2>
                  <Line data={lineChart} />
                </div>
              </div>

              <div className="chart-grid small">
                <div className="chart-card">
                  <h2>Loss Bar Chart</h2>
                  <Bar data={barChart} />
                </div>

                <div className="chart-card">
                  <h2>Fault Radar</h2>
                  <Radar data={radarChart} />
                </div>
              </div>
            </>
          )}

          {/* PANELS TAB */}
          {activeTab === "panels" && (
            <>
              <div className="panel-search">
                <input
                  placeholder="Search panels..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <small>{filteredPanels.length} results</small>
              </div>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Panel No</th>
                    <th>Loss (kWh)</th>
                    <th>Image Signature</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPanels.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.panel_number}</td>
                      <td>{p.panel_loss_kwh}</td>
                      <td>{p.image_signature}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
