import React from "react";

export default function CropHealth({ data }) {
  if (!data) return null;
  const { stress_probability, healthy_probability, status, color, prediction } = data;

  const colorMap = {
    green:  { main: "#16a34a", bg: "#dcfce7", badge: "badge-green" },
    orange: { main: "#ca8a04", bg: "#fef9c3", badge: "badge-yellow" },
    red:    { main: "#dc2626", bg: "#fee2e2", badge: "badge-red" },
  };
  const c = colorMap[color] || colorMap.green;

  const r = 52;
  const circ = 2 * Math.PI * r;
  const filled = (stress_probability / 100) * circ;

  return (
    <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
      {/* Donut gauge */}
      <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
          <circle
            cx="70" cy="70" r={r} fill="none"
            stroke={c.main} strokeWidth="12"
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)", textAlign: "center",
        }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: c.main }}>{stress_probability}%</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Stress</div>
        </div>
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 180 }}>
        <span className={`badge ${c.badge}`} style={{ marginBottom: 16, display: "inline-flex", fontSize: 12 }}>
          {prediction === 0 ? "🌱 Healthy" : `⚠️ ${status}`}
        </span>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Stress Risk</span>
            <span style={{ color: c.main, fontWeight: 700 }}>{stress_probability}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stress_probability}%`, background: c.main }} />
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>Healthy Signal</span>
            <span style={{ color: "#16a34a", fontWeight: 700 }}>{healthy_probability}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${healthy_probability}%`, background: "#16a34a" }} />
          </div>
        </div>

        <div style={{
          marginTop: 16, padding: "10px 14px", borderRadius: 8,
          background: c.bg, border: `1px solid ${c.main}30`,
          fontSize: 12, color: "var(--text-secondary)"
        }}>
          {prediction === 0
            ? "✅ Crop conditions appear healthy. Continue normal monitoring."
            : "⚠️ Elevated stress detected. Check nutrient levels and irrigation schedule."}
        </div>
      </div>
    </div>
  );
}
