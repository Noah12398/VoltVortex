import React from "react";

const URGENCY = {
  High:   { main: "#dc2626", bg: "#fee2e2", bar: "#f87171", badge: "badge-red",    icon: "🚨" },
  Medium: { main: "#ca8a04", bg: "#fef9c3", bar: "#fbbf24", badge: "badge-yellow", icon: "⚠️" },
  Low:    { main: "#16a34a", bg: "#dcfce7", bar: "#4ade80", badge: "badge-green",  icon: "✅" },
};
const PRIORITY = { High: "badge-red", Medium: "badge-yellow", Low: "badge-green" };

export default function IrrigationFert({ data }) {
  if (!data) return null;
  const { soil_moisture_pct, irrigation, fertilization } = data;
  const u = URGENCY[irrigation.urgency] || URGENCY.Low;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>

      {/* Irrigation */}
      <div className="card" style={{ padding: 24, borderTop: `3px solid ${u.bar}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: u.bg,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>💧</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Irrigation Status</div>
            <span className={`badge ${u.badge}`} style={{ fontSize: 11 }}>
              {u.icon} {irrigation.urgency} Priority
            </span>
          </div>
        </div>

        {/* Moisture gauge */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Soil Moisture</span>
            <span style={{ fontWeight: 700, color: u.main }}>{soil_moisture_pct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${soil_moisture_pct}%`, background: `linear-gradient(90deg, #f87171, #fbbf24, #4ade80)` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 10, color: "var(--text-muted)" }}>
            <span>Dry</span><span>Wet</span>
          </div>
        </div>

        <div style={{
          padding: "12px 14px", borderRadius: 8,
          background: u.bg, borderLeft: `3px solid ${u.bar}`,
          marginBottom: 12,
        }}>
          <div style={{ fontWeight: 700, color: u.main, marginBottom: 3 }}>{irrigation.action}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{irrigation.detail}</div>
        </div>

        {irrigation.amount_liters_per_sqm > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
            🚿 Recommended: <strong style={{ color: "#1a56db" }}>{irrigation.amount_liters_per_sqm} L/m²</strong>
          </div>
        )}
      </div>

      {/* Fertilization */}
      <div className="card" style={{ padding: 24, borderTop: "3px solid #86efac" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: "#dcfce7",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>🌿</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Fertilization Plan</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {fertilization.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "12px 14px", borderRadius: 8,
              background: "#f8faff", border: "1px solid var(--border)",
            }}>
              <span className={`badge ${PRIORITY[item.priority] || "badge-blue"}`} style={{ fontSize: 10, flexShrink: 0, marginTop: 2 }}>
                {item.priority}
              </span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.nutrient}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.action}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
