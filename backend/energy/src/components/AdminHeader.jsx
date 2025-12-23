import React from "react";
import "../styles/adminLayout.css";

export default function AdminHeader({ onToggleTheme, theme, searchValue, setSearchValue }) {
  return (
    <header className="admin-header">
      <div className="header-left">
        {/* <button className="collapse-btn" title="Toggle sidebar">☰</button> */}
        <h1 className="header-title">Admin Dashboard</h1>
      </div>

      <div className="header-right">
        <input
          type="search"
          placeholder="Search panels, images..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="header-search"
        />

        <button className="theme-btn" onClick={onToggleTheme}>
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

        <div className="profile-pill">Admin 👤</div>
      </div>
    </header>
  );
}
