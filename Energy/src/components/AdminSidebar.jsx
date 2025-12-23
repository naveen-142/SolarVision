import React from "react";
import "../styles/adminLayout.css";

export default function AdminSidebar({ items = [], collapsed=false }) {
  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">⚡ PowerForge</div>

      <nav className="sidebar-nav">
        {items.map((it) => (
          <a key={it.key} href={it.href} className="sidebar-link">
            <span className="sidebar-icon">{it.icon}</span>
            <span className="sidebar-text">{it.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
