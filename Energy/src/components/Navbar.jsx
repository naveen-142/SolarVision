import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import logo from "../assets/logo.jpg";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loggedIn, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("User");

  const isActive = (path) => location.pathname === path;

  // 🔥 FETCH USER NAME FROM FIRESTORE
  useEffect(() => {
    const fetchUserName = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserName(userSnap.data().name);
        }
      } catch (err) {
        console.error("Failed to fetch user name", err);
      }
    };

    if (loggedIn) {
      fetchUserName();
    }
  }, [loggedIn]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black">
      <div className="container">

        <Link className="navbar-brand d-flex align-items-center fw-bold" to="/home">
          <img src={logo} alt="Logo" width="45" height="45" className="me-2 rounded-circle" />
          PowerForge
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav ms-auto align-items-center">

            <li className="nav-item">
              <Link className={`nav-link ${isActive("/home") ? "active-link" : ""}`} to="/home">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className={`nav-link ${isActive("/about") ? "active-link" : ""}`} to="/about">
                AboutUs
              </Link>
            </li>

            <li className="nav-item">
              <Link className={`nav-link ${isActive("/datascience") ? "active-link" : ""}`} to="/datascience">
                Our Ai
              </Link>
            </li>

            <li className="nav-item">
              <Link className={`nav-link ${isActive("/contact") ? "active-link" : ""}`} to="/contact">
                ContactUs
              </Link>
            </li>

            {/* 🔐 NOT LOGGED IN */}
            {!loggedIn && (
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
            )}

            {/* ✅ LOGGED IN → SHOW NAME */}
            {loggedIn && (
              <li className="nav-item ms-3 position-relative">
                <button
                  className="btn btn-outline-light"
                  onClick={() => setOpen(!open)}
                >
                  Welcome, {userName}
                </button>

                {open && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white text-dark rounded shadow"
                    style={{ minWidth: "200px", zIndex: 1000 }}
                  >
                    <Link className="dropdown-item" to="/dashboard">
                      👤 User Profile
                    </Link>

                    <div className="dropdown-divider"></div>

                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
