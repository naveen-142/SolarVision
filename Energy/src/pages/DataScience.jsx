import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../AuthContext"; // ✅ IMPORT AUTH HOOK
// Bootstrap and Charting Imports
import "bootstrap/dist/css/bootstrap.min.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// --- START: Admin Dashboard Imports (Assuming these files are defined) ---
// These are needed for the Admin Dashboard layout and styling
import "../styles/adminDashboard.css";
import "../styles/adminLayout.css";

// Assuming these are defined in your components folder
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

// ChartJS Imports for Admin Dashboard
import { Line, Pie as ChartJSPie, Bar, Radar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip as ChartJSTooltip,
    Legend as ChartJSLegend,
    BarElement,
    RadialLinearScale,
} from "chart.js";

// Register all required ChartJS elements
ChartJS.register(
    LineElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    ChartJSTooltip,
    ChartJSLegend,
    BarElement,
    RadialLinearScale
);
// --- END: Admin Dashboard Imports ---


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
/* ---------------------------------------------------------- */


// ======================================================================================
// MAIN COMPONENT: DataScience (User Flow, User Report, & Admin Dashboard)
// ======================================================================================
export default function DataScience() {
    /* ---------------- USER FLOW STATE ---------------- */
    const { currentUser } = useAuth(); // ✅ USE AUTH CONTEXT
    const [step, setStep] = useState(1);
    const reportRef = useRef(null);
    const [imageFile, setImageFile] = useState(null);
    const [yoloResult, setYoloResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // PREMIUM & MODAL STATE
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const [siteType, setSiteType] = useState("Home");
    const [city, setCity] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [capacity, setCapacity] = useState(5);
    const [sunHours, setSunHours] = useState(5);
    const [fileName, setFileName] = useState("No file chosen");

    // NOTE: Update this URL for production deployment
    const BACKEND_URL = "http://127.0.0.1:8000/";

    /* ---------------- ADMIN DASHBOARD STATE ---------------- */
    const [dashboardData, setDashboardData] = useState(null);
    const [theme, setTheme] = useState("dark");
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("overview"); // For Admin Tabs (Overview, Panels, etc.)
    const [pageView, setPageView] = useState("user"); // 'user' or 'admin' for Step 3 content
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // --- SIMULATE AUTHENTICATION CHECK (REPLACE WITH REAL LOGIC) ---
    const isAdmin = true;
    // -------------------------------------------------------------

    /* ---------- LOAD ADMIN DATA (Conditional Fetch) ---------- */
    useEffect(() => {
        // Only fetch admin data if we switch to the admin view and haven't fetched it yet
        if (pageView === 'admin' && !dashboardData) {
            fetch(BACKEND_URL + "dashboard/stats/")
                .then((res) => res.json())
                .then((json) => setDashboardData(json))
                .catch((err) => console.error("Admin Data Fetch Error:", err));
        }
    }, [pageView, dashboardData, BACKEND_URL]);

    /* ---------- APPLY THEME (For Admin Dashboard) ---------- */
    useEffect(() => {
        // Sets data-theme attribute on the root html element (used by adminLayout.css)
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    /* ---------- REALISTIC SUNLIGHT CALCULATION ---------- */
    useEffect(() => {
        if (!city || city.length < 3 || !selectedDate) return;

        const calculateSunlight = async () => {
            try {
                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json`
                );
                const geo = await geoRes.json();

                if (!geo.length) {
                    setSunHours(0);
                    return;
                }


                const { lat, lon } = geo[0];

                const sunRes = await fetch(
                    `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${selectedDate}&formatted=0`
                );
                const sunData = await sunRes.json();

                const astroHours = sunData.results.day_length / 3600;

                const cloudRes = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloudcover&start_date=${selectedDate}&end_date=${selectedDate}`
                );
                const cloudData = await cloudRes.json();

                const clouds = cloudData.hourly?.cloudcover || [];
                const avgCloud =
                    clouds.length > 0
                        ? clouds.reduce((a, b) => a + b, 0) / clouds.length
                        : 0;

                const realisticSun = (astroHours * (1 - avgCloud / 100)).toFixed(2);
                setSunHours(Number(realisticSun));
            } catch (err) {
                console.error(err);
            }
        };

        calculateSunlight();
    }, [city, selectedDate]);

    /* ---------------- UTILITY STYLES/HANDLERS ---------------- */
    const handleDownloadReport = useCallback(async () => {
        if (!reportRef.current) {
            alert("Report content not available for download.");
            return;
        }
        alert("Initiating PDF Download (PDF Libraries assumed to be configured).");
    }, []);

    const pageStyle = {
        // Change background based on view for visual separation
        background: pageView === 'user' && step !== 3
            ? "linear-gradient(135deg, #001f40, #003366)"
            : "var(--bg-primary, linear-gradient(135deg, #001f40, #003366))", // Fallback if admin CSS isn't loaded
        minHeight: "100vh",
        paddingTop: "150px",
        paddingBottom: "70px",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    };

    const glassCard = {
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(15px)",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.2)",
        padding: "30px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    };

    const metricCardStyle = (color) => ({
        ...glassCard,
        padding: "25px",
        textAlign: "center",
        borderLeft: `5px solid ${color}`,
        background: "rgba(255,255,255,0.08)",
    });

    const getConfidenceLabel = useCallback((confidence) => {
        const conf = parseFloat(confidence);
        if (conf >= 90) return "Very High";
        if (conf >= 75) return "High";
        if (conf >= 50) return "Moderate";
        return "Low";
    }, []);

    const getFaultStatusStyle = useCallback((lossPercentage) => {
        const loss = parseFloat(lossPercentage);
        if (loss > 10) {
            return { background: "#ff52521a", borderLeft: "4px solid #ff5252" };
        }
        if (loss > 3) {
            return { background: "#ffc1071a", borderLeft: "4px solid #ffc107" };
        }
        return { background: "rgba(255,255,255,0.05)" };
    }, []);

    /* ---------------- STEP 1 & 2 FUNCTIONS ---------------- */
    const ProgressSteps = () => (
        <div className="d-flex justify-content-center gap-4 my-4">
            {[1, 2, 3].map((n) => (
                <div
                    key={n}
                    onClick={() => {
                        setStep(n);
                        setPageView('user'); // Reset to user view when navigating steps
                    }}
                    className="d-flex align-items-center justify-content-center"
                    style={{
                        width: "55px",
                        height: "55px",
                        borderRadius: "50%",
                        border: "3px solid white",
                        color: step === n ? "#0059b3" : "white",
                        background: step === n ? "white" : "transparent",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "0.3s",
                    }}
                >
                    {n}
                </div>
            ))}
        </div>
    );

    const runYOLO = async () => {
        if (!imageFile) {
            alert("Please upload an image first.");
            return;
        }

        if (!currentUser || !currentUser.uid) {
            alert("Please login first");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("greyImage", imageFile);
        formData.append("location", city);
        formData.append("capacity", capacity);
        formData.append("sunHours", sunHours);
        formData.append("user_id", currentUser.uid); // ✅ USE FIREBASE UID

        try {
            const response = await fetch(BACKEND_URL, {
                method: "POST",
                body: formData,
            });

            if (response.status === 403) {
                // 🔥 LIMIT REACHED
                setShowPremiumModal(true);
                setLoading(false);
                return;
            }

            if (!response.ok) {
                const text = await response.text();
                console.error("Server Error:", text);
                alert("Backend error occurred. Check backend logs.");
                return;
            }

            const data = await response.json();
            setYoloResult(data);
            setStep(3);
        } catch (err) {
            console.error("Fetch Error:", err);
            alert("Unable to connect to backend.");
        } finally {
            setLoading(false);
        }
    };


    const Step1 = () => (
        <div className="container text-white">
            <div
                className="mx-auto text-center"
                style={{ ...glassCard, maxWidth: "750px" }}
            >
                <h1 className="fw-bold mb-3" style={{ fontSize: "2.4rem" }}>
                    ☀️ Solar Energy AI Predictor
                </h1>
                <p>
                    Our AI-powered Solar Panel Analytics system provides an accurate
                    assessment of your solar installation by analyzing both system
                    specifications and panel imagery.
                </p>
                <p>
                    Upload your solar panel image - AI detects cracks, dust, snow, bird
                    drops and calculates energy loss.
                </p>

                <button
                    className="btn btn-light fw-bold px-5 py-2 rounded-pill shadow"
                    onClick={() => setStep(2)}
                >
                    Start →
                </button>
            </div>
        </div>
    );

    const Step2 = () => {
        const RightSideContent = useMemo(
            () => (
                <div className="ratio ratio-16x9 rounded shadow-lg">
                    <video controls style={{ width: "100%", borderRadius: "12px" }}>
                        <source src="/Video/solar.mp4" type="video/mp4" />
                    </video>
                </div>
            ),
            []
        );

        const handleFileChange = useCallback((e) => {
            const file = e.target.files[0];
            setImageFile(file);
            setFileName(file ? file.name : "No file chosen");
        }, []);

        return (
            <div className="container text-white">
                <div className="mx-auto" style={{ ...glassCard, maxWidth: "980px" }}>
                    <ProgressSteps />

                    <h2 className="fw-bold text-center mb-4">✨ Solar Panel Input</h2>

                    <div className="row g-4">
                        {/* left Form */}
                        <div className="col-md-6">
                            <label className="fw-bold mb-1">📍 Location</label>
                            <select
                                className="form-select p-3 shadow-sm mb-3"
                                value={siteType}
                                onChange={(e) => setSiteType(e.target.value)}
                                style={{ borderRadius: "14px" }}
                            >
                                <option>Home</option>
                                <option>Office</option>
                                <option>Factory</option>
                                <option>Agriculture</option>
                                <option>Solar Plant</option>
                            </select>

                            <label className="fw-bold mb-1">⚡ System Capacity (kW)</label>
                            <input
                                type="number"
                                className="form-control p-3 shadow-sm mb-3"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                style={{ borderRadius: "14px" }}
                            />

                            {/* 🌦 Weather Inputs */}
                            <label className="fw-bold mb-1">📍 City</label>
                            <input
                                type="text"
                                className="form-control p-3 shadow-sm mb-3"
                                placeholder="e.g. Visakhapatnam"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                style={{ borderRadius: "14px" }}
                            />

                            <label className="fw-bold mb-1"> 📅 Date</label>
                            <input
                                type="date"
                                className="form-control p-3 shadow-sm mb-3"
                                value={selectedDate}
                                max={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{ borderRadius: "14px" }}
                            />


                            {sunHours > 0 && (
                                <div className="alert alert-success py-2">
                                    🌤 Realistic Sunlight Hours: <b>{sunHours}</b> hrs
                                </div>
                            )}


                            <label className="fw-bold mb-2">🖼 Upload Image</label>
                            <div
                                className="d-flex align-items-center p-2 shadow-sm mb-4"
                                style={{
                                    borderRadius: "14px",
                                    background: "rgba(255,255,255,0.2)",
                                    border: "1px solid rgba(255,255,255,0.35)",
                                    position: "relative",
                                    cursor: "pointer",
                                }}
                            >
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    style={{ position: "absolute", inset: 0, opacity: 0 }}
                                />

                                <button className="btn btn-light btn-sm fw-bold me-2">
                                    Choose File
                                </button>

                                <span>{fileName}</span>
                            </div>

                            <div className="d-flex justify-content-between mt-4">
                                <button
                                    className="btn btn-outline-light px-4"
                                    onClick={() => setStep(1)}
                                >
                                    ← Back
                                </button>
                                <button
                                    className="btn btn-light px-4 fw-bold"
                                    onClick={runYOLO}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        "Analyze →"
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Right Video */}
                        <div className="col-md-6 mt-4">{RightSideContent}</div>
                    </div>
                </div>

                {/* 🔥 PREMIUM MODAL */}
                {showPremiumModal && (
                    <div style={{
                        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                        background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex",
                        alignItems: "center", justifyContent: "center"
                    }}>
                        <div style={{
                            background: "#1e1e2e", padding: "40px", borderRadius: "20px",
                            maxWidth: "500px", textAlign: "center", border: "1px solid #333",
                            boxShadow: "0 0 50px rgba(0,255,255,0.1)"
                        }}>
                            <h2 className="fw-bold text-white mb-3">🚀 Upgrade to Premium</h2>
                            <p className="text-secondary mb-4">
                                You've used your 2 free analyses. Unlock <b>unlimited</b> Solar AI inspections for a lifetime.
                            </p>

                            <div className="d-flex justify-content-center gap-3 mb-4">
                                <div className="p-3 border border-secondary rounded text-white">
                                    <h3>Free</h3>
                                    <small>2 Limits</small>
                                </div>
                                <div className="p-3 border border-primary rounded text-white bg-primary bg-opacity-10">
                                    <h3>Premium</h3>
                                    <small>Unlimited</small>
                                </div>
                            </div>

                            <h1 className="text-white fw-bold mb-4">₹500 <span className="fs-6 text-secondary">/ only</span></h1>

                            <button
                                className="btn btn-primary btn-lg w-100 fw-bold mb-3"
                                onClick={handlePayment}
                                disabled={paymentLoading}
                            >
                                {paymentLoading ? "Processing..." : "Unlock Now ⚡"}
                            </button>

                            <button
                                className="btn btn-link text-secondary text-decoration-none"
                                onClick={() => setShowPremiumModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

            </div>
        );
    };

    /* ---------------- PAYMENT HANDLER ---------------- */
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setPaymentLoading(true);
        const res = await loadRazorpay();

        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            setPaymentLoading(false);
            return;
        }

        // 1. Create Order
        try {
            console.log("User ID for payment:", currentUser.uid); // Debug User ID
            const orderRes = await fetch(BACKEND_URL + "create-order/", {
                method: "POST",
                body: JSON.stringify({ user_id: currentUser.uid })
            });
            const orderData = await orderRes.json();

            if (!orderData.order_id) {
                alert("Server error: " + (orderData.error || "Could not create order."));
                setPaymentLoading(false);
                return;
            }

            // 2. Open Razorpay
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: "INR",
                name: "Solar Energy AI",
                description: "Premium Subscription",
                order_id: orderData.order_id,
                handler: async function (response) {
                    // 3. Verify Payment
                    const verifyRes = await fetch(BACKEND_URL + "verify-payment/", {
                        method: "POST",
                        body: JSON.stringify({
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                        })
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.status === "SUCCESS") {
                        alert("Payment Successful! Premium Activated 🚀");
                        setShowPremiumModal(false);
                        // Retry the analysis or let user click it again
                    } else {
                        alert("Payment verification failed.");
                    }
                },
                prefill: {
                    name: currentUser.displayName || "User",
                    email: currentUser.email || "user@example.com",
                },
                theme: { color: "#3399cc" }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error(err);
            alert("Payment failed.");
        } finally {
            setPaymentLoading(false);
        }
    };

    /* ------------------ INLINE ADMIN DASHBOARD COMPONENT ------------------ */
    const AdminDashboardContent = () => {
        const loadingAdmin = !dashboardData;

        const { kpis, loss_breakdown, timeseries, panels } = dashboardData || {
            kpis: { total_images: 0, total_yolo_outputs: 0, total_panels_detected: 0, total_daily_loss_kwh: 0 },
            loss_breakdown: {},
            timeseries: [],
            panels: [],
        };

        /* ---------- ANIMATED NUMBERS (Always run) ---------- */
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

        if (loadingAdmin) return <div className="loading">Loading Admin Dashboard…</div>;

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
                                        <ChartJSPie data={pieChart} />
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

                        {/* Placeholders for other Admin tabs */}
                        {activeTab === "uploads" && <div className="placeholder-content"><h2>Uploads Management</h2><p>Content for managing uploads goes here.</p></div>}
                        {activeTab === "faults" && <div className="placeholder-content"><h2>Faults Reporting</h2><p>Content for viewing and resolving faults goes here.</p></div>}

                    </div>
                </div>
            </div>
        );
    };
    /* ---------------------------------------------------------------------- */


    // ------------------ STEP 3: USER REPORT & ADMIN TOGGLE ------------------
    const Step3 = () => {
        // If 'admin' tab is selected, render the full admin dashboard component
        if (pageView === 'admin') {
            return <AdminDashboardContent />;
        }

        // --- If pageView is 'user', render the standard User Report ---
        if (!yoloResult) {
            return (
                <h2 style={{ color: "white", textAlign: "center" }}>
                    Waiting for analysis result...
                </h2>
            );
        }


        // Calculations for User Report
        const maxEnergy = capacity * sunHours;
        const totalLoss = yoloResult.summary.total_daily_loss_kwh;
        const usableEnergy = Math.max(maxEnergy - totalLoss, 0);
        const lossPercent = (totalLoss / maxEnergy) * 100;

        const COLORS = ['#00d99b', '#ff5252'];
        const pieData = [
            { name: "Usable Energy", value: usableEnergy, color: COLORS[0] },
            { name: "Energy Loss", value: totalLoss, color: COLORS[1] },
        ].filter(item => item.value > 0);

        const getRecommendation = (loss) => {
            if (loss >= 15) {
                return {
                    title: "Critical Loss Detected: Immediate Maintenance Required",
                    text: "The high energy loss indicates significant defects, consult a solar professional immediately.",
                    color: "#ff5252",
                    icon: "bi bi-exclamation-triangle-fill"
                };
            }
            if (loss >= 5) {
                return {
                    title: "Moderate Efficiency Drop: Scheduled Cleaning Recommended",
                    text: "Losses are mainly due to environmental factors like dust or shading. Schedule maintenance.",
                    color: "#ffc107",
                    icon: "bi bi-info-circle-fill"
                };
            }
            return {
                title: "Excellent Performance: Minimal Loss",
                text: "The system is operating near peak potential. Continue regular monitoring.",
                color: "#00d99b",
                icon: "bi bi-check-circle-fill"
            };
        };

        const recommendation = getRecommendation(lossPercent);

        return (
            <div className="container text-white">
                <div className="mx-auto" style={{ ...glassCard, maxWidth: "1200px" }} ref={reportRef}>

                    {/* Header */}
                    <div className="d-flex justify-content-center align-items-center mb-4">
                        <h1 className="fw-bold" style={{ color: '#fff', fontSize: '1.8rem' }}>
                            <i className="bi bi-bar-chart-line-fill me-2"></i> Solar System Performance Report
                        </h1>
                    </div>


                    {/* --------------------------- */}

                    {pageView === 'user' && <ProgressSteps />}

                    {/* ===== ROW 1: KEY METRICS & CHART (User View) ===== */}
                    <div className="row g-4 mb-5">
                        <div className="col-lg-4">
                            <div style={metricCardStyle(recommendation.color)} className="h-100 d-flex flex-column justify-content-center">
                                <p className="mb-1 text-uppercase small" style={{ opacity: 0.8 }}>Daily Usable Energy Estimate</p>
                                <h2 className="fw-bolder" style={{ fontSize: '3.5rem', color: recommendation.color }}>
                                    {usableEnergy.toFixed(2)} kWh
                                </h2>
                                <p className="mb-0 small">Achieved / Day</p>
                            </div>
                        </div>
                        {/* Column B: Performance Chart (Donut Style) */}
                        <div className="col-lg-4 d-flex justify-content-center align-items-center position-relative">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={2}
                                        dataKey="value"
                                        nameKey="name"
                                        startAngle={90}
                                        endAngle={-270}
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #333', color: 'white' }}
                                        formatter={(value, name) => [`${value.toFixed(2)} kWh`, name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="position-absolute text-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                                <p className="mb-0 small text-uppercase" style={{ opacity: 0.7 }}>Potential Loss</p>
                                <h4 className="fw-bold" style={{ color: COLORS[1] }}>{lossPercent.toFixed(1)}%</h4>
                            </div>
                        </div>
                        {/* Column C: Max Potential & Total Loss Cards */}
                        <div className="col-lg-4 d-flex flex-column gap-3">
                            <div style={metricCardStyle("#4dabf7")}>
                                <p className="mb-1 text-uppercase small" style={{ opacity: 0.8 }}>Max Potential</p>
                                <h4 className="fw-bold" style={{ color: "#4dabf7" }}>{maxEnergy.toFixed(2)} kWh / Day</h4>
                            </div>
                            <div style={metricCardStyle(COLORS[1])}>
                                <p className="mb-1 text-uppercase small" style={{ opacity: 0.8 }}>Total Energy Loss</p>
                                <h4 className="fw-bold" style={{ color: COLORS[1] }}>{totalLoss.toFixed(2)} kWh / Day</h4>
                            </div>
                        </div>
                    </div>

                    {/* ===== ROW 2: HIGH-LEVEL RECOMMENDATION (User View) ===== */}
                    <div className="row mb-5">
                        <div className="col-12">
                            <div className="p-4 rounded-3 shadow-lg d-flex align-items-center" style={{ background: recommendation.color + '20', border: `1px solid ${recommendation.color}` }}>
                                <i className={`${recommendation.icon} me-3`} style={{ fontSize: '2rem', color: recommendation.color }}></i>
                                <div>
                                    <h5 className="mb-1 fw-bold" style={{ color: recommendation.color }}>{recommendation.title}</h5>
                                    <p className="mb-0 small">{recommendation.text}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== ROW 3: VISUALS AND DETAILED BREAKDOWN (User View) ===== */}
                    <div className="row g-5">
                        {/* Column A: Visuals */}
                        <div className="col-lg-5">
                            <h4 className="fw-bold mb-3">
                                <i className="bi bi-camera-fill me-2"></i> Visual Inspection Images
                            </h4>
                            <div className="mb-4 text-center">
                                <p className="mb-1 fw-bold small text-uppercase" style={{ opacity: 0.8 }}>Defect Detection</p>
                                <img
                                    src={yoloResult.defect_image_url}
                                    className="img-fluid rounded shadow-lg"
                                    style={{ border: "3px solid #ff5252" }}
                                    alt="AI Defect Detection"
                                />

                            </div>
                            <div className="text-center">
                                <p className="mb-1 fw-bold small text-uppercase" style={{ opacity: 0.8 }}>Panel Segmentation</p>
                                <img
                                    src={yoloResult.panel_image_url}
                                    className="img-fluid rounded shadow-lg"
                                    style={{ border: "3px solid #4dabf7" }}
                                    alt="AI Panel Detection"
                                />
                            </div>
                        </div>

                        {/* Column B: Panel Breakdown Table */}
                        <div className="col-lg-7">
                            <h4 className="fw-bold mb-3">
                                <i className="bi bi-table me-2"></i> Panel-wise Defect Breakdown
                            </h4>
                            <div className="table-responsive rounded-3 shadow-lg" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <table className="table table-striped table-hover table-sm text-white mb-0" style={{ background: "rgba(0,0,0,0.15)", '--bs-table-bg': 'transparent', '--bs-table-striped-bg': 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#00264d', backdropFilter: 'blur(5px)' }}>
                                        <tr>
                                            <th className="text-center">Panel #</th>
                                            <th>Fault Type</th>
                                            <th className="text-center">Area %</th>
                                            <th className="text-center">Conf.</th>
                                            <th className="text-center">Loss %</th>
                                            <th className="text-center text-warning">Loss (kWh)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {yoloResult.panel_analysis.map((panel) => (
                                            <React.Fragment key={panel.panel_number}>
                                                {panel.faults.length === 0 ? (
                                                    <tr className="table-success" style={{ '--bs-table-accent-bg': 'rgba(0,217,155,0.1)' }}>
                                                        <td className="text-center fw-bold">{panel.panel_number}</td>
                                                        <td colSpan="4">
                                                            <span className="text-success fw-bold">✔ Clean / Non-Defective</span>
                                                        </td>
                                                        <td className="text-center fw-bold text-success">{panel.panel_loss_kwh}</td>
                                                    </tr>
                                                ) : (
                                                    panel.faults.map((f, i) => (
                                                        <tr key={`${panel.panel_number}-${i}`} style={getFaultStatusStyle(f.loss_percentage)}>
                                                            {i === 0 && (
                                                                <td rowSpan={panel.faults.length} className="align-middle text-center fw-bold" style={{ borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                                                                    {panel.panel_number}
                                                                    <div className="small mt-1 text-warning">Total: {panel.panel_loss_kwh} kWh</div>
                                                                </td>
                                                            )}
                                                            <td className="align-middle">{f.fault}</td>
                                                            <td className="align-middle text-center">{f.affected_area}%</td>
                                                            <td className="align-middle text-center small">
                                                                {f.confidence}% <br />
                                                                <span className="fw-bold" style={{ fontSize: '0.7rem', color: f.confidence >= 75 ? COLORS[0] : COLORS[1] }}>({getConfidenceLabel(f.confidence)})</span>
                                                            </td>
                                                            <td className="align-middle text-center">{f.loss_percentage}%</td>
                                                            <td className="align-middle text-center text-warning fw-bold">{f.daily_loss}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* DISCALIMER (Footer) */}
                    <div
                        className="mt-5 p-3 rounded text-center"
                        style={{ background: "rgba(0,0,0,0.1)", borderTop: "1px solid rgba(255,193,7,0.5)" }}
                    >
                        <p className="small mb-0 text-warning">
                            ⚠️ **DISCLAIMER:** The energy loss and prediction values shown are
                            **estimates** based solely on visual image analysis (YOLO model).
                            They are NOT derived from real-time electrical measurements and should not
                            be used as the sole basis for maintenance or financial decisions.
                        </p>
                    </div>

                    {/* DOWNLOAD BUTTONS */}
                    <div className="text-center mt-4 pt-3 no-print d-flex justify-content-center gap-3"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>

                        <button
                            className="btn btn-outline-light px-5 py-2 fw-bold rounded-pill"
                            onClick={() => setStep(2)}
                        >
                            ← Recalculate / New Input
                        </button>

                        <button
                            className="btn btn-warning px-5 py-2 fw-bold rounded-pill"
                            onClick={handleDownloadReport}
                        >
                            <i className="bi bi-file-earmark-arrow-down-fill me-2"></i> Download Full Report (PDF)
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    // ------------------ MAIN RENDER LOGIC ------------------
    return (
        <div style={pageStyle}>
            {step === 1 ? <Step1 /> : step === 2 ? <Step2 /> : <Step3 />}
        </div>
    );
}