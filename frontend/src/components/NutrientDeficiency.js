import React from "react";

const NUTRIENT_META = {
  N: { label: "Nitrogen",    icon: "🟢", unit: "mg/kg", color: "#16a34a", bg: "#dcfce7", bar: "#4ade80" },
  P: { label: "Phosphorus",  icon: "🔵", unit: "mg/kg", color: "#1a56db", bg: "#dbeafe", bar: "#60a5fa" },
  K: { label: "Potassium",   icon: "🟠", unit: "mg/kg", color: "#ea580c", bg: "#ffedd5", bar: "#fb923c" },
};

const STATUS_BADGE = {
  "Optimal":           { cls: "badge-green",  emoji: "✅" },
  "Mild Deficiency":   { cls: "badge-yellow", emoji: "⚠️" },
  "Severe Deficiency": { cls: "badge-red",    emoji: "🚨" },
  "Excess":            { cls: "badge-purple", emoji: "📈" },
};

export default function NutrientDeficiency({ data }) {
  if (!data) return null;
  const { nutrients, deficiencies_detected, ph_warning, overall_status } = data;

  return (
    <div>
      {/* Overall header */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <span className={`badge ${overall_status === "Balanced" ? "badge-green" : "badge-red"}`} style={{ fontSize: 12 }}>
          {overall_status === "Balanced" ? "✅ All nutrients balanced" : `⚠️ ${deficiencies_detected.length} deficiency detected`}
        </span>
        {ph_warning && (
          <span className="badge badge-yellow" style={{ fontSize: 11 }}>⚗️ {ph_warning}</span>
        )}
      </div>

      {/* NPK Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {Object.entries(nutrients).map(([key, info]) => {
          const m = NUTRIENT_META[key];
          const maxVal = key === "N" ? 250 : key === "P" ? 150 : 250;
          const pct = Math.min(100, (info.value / maxVal) * 100);
          const badge = STATUS_BADGE[info.status] || { cls: "badge-blue", emoji: "ℹ️" };

          return (
            <div key={key} className="card" style={{
              padding: "20px",
              borderTop: `3px solid ${m.bar}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: m.bg,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>{m.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>({key})</div>
                  </div>
                </div>
                <span className={`badge ${badge.cls}`} style={{ fontSize: 10 }}>
                  {badge.emoji} {info.status}
                </span>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{
                  fontSize: 28, fontWeight: 800, color: m.color, lineHeight: 1,
                  marginBottom: 2,
                }}>
                  {info.value} <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>{m.unit}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Optimal: {info.range}</div>
              </div>

              <div className="progress-bar" style={{ marginBottom: 12 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: m.bar }} />
              </div>

              <div style={{
                padding: "8px 10px", borderRadius: 7,
                background: m.bg, fontSize: 12, color: "var(--text-secondary)",
                borderLeft: `3px solid ${m.bar}`,
              }}>
                💊 {info.recommendation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
