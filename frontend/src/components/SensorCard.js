import React from "react";

/* Sensor card color palette (pastel, like the OpenDesk category cards) */
const PALETTE = {
  red:    { icon: "#dc2626", bg: "#fee2e2", border: "#fca5a5" },
  blue:   { icon: "#1a56db", bg: "#dbeafe", border: "#93c5fd" },
  cyan:   { icon: "#0891b2", bg: "#cffafe", border: "#67e8f9" },
  green:  { icon: "#16a34a", bg: "#dcfce7", border: "#86efac" },
  purple: { icon: "#7c3aed", bg: "#ede9fe", border: "#c4b5fd" },
  orange: { icon: "#ea580c", bg: "#ffedd5", border: "#fdba74" },
  teal:   { icon: "#0d9488", bg: "#ccfbf1", border: "#5eead4" },
};

export default function SensorCard({ label, value, unit, icon, color = "blue", simulated }) {
  const p = PALETTE[color] || PALETTE.blue;

  return (
    <div className="card" style={{
      padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: 10,
      position: "relative",
      borderTop: `3px solid ${p.border}`,
    }}>
      {/* Icon circle */}
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: p.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}>
        {icon}
      </div>

      <div>
        <div className="section-title">{label}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginTop: 2 }}>
          <span className="section-value" style={{ color: p.icon }}>{value ?? "—"}</span>
          {unit && <span className="section-unit">{unit}</span>}
        </div>
      </div>

      {simulated && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "2px 8px", borderRadius: 99,
          background: "#fef9c3", border: "1px solid #fde68a",
          fontSize: 10, fontWeight: 600, color: "#92400e",
        }}>
          ⚡ Simulated
        </div>
      )}
    </div>
  );
}
