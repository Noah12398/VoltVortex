import React from "react";

export default function AnomalyAlert({ data }) {
  if (!data) return null;
  const { is_anomaly, score, severity, anomalous_features, message } = data;

  const statusStyle = is_anomaly
    ? { bg: "#fee2e2", border: "#fca5a5", icon: "#dc2626", badge: "badge-red" }
    : { bg: "#dcfce7", border: "#86efac", icon: "#16a34a", badge: "badge-green" };

  const featureLabels = {
    temperature: "Temperature 🌡️",
    humidity:    "Humidity 💧",
    soil_moisture: "Soil Moisture 🪴",
    ph:          "pH Level ⚗️",
    N:           "Nitrogen (N) 🟢",
    P:           "Phosphorus (P) 🔵",
    K:           "Potassium (K) 🟠",
  };

  return (
    <div>
      {/* Status banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: 20,
        padding: "20px 24px", borderRadius: 12, marginBottom: 20,
        background: statusStyle.bg,
        border: `1px solid ${statusStyle.border}`,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "#fff", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 26,
          boxShadow: `0 0 0 4px ${statusStyle.border}`,
          flexShrink: 0,
          ...(is_anomaly ? { animation: "pulseRing 1.8s ease-out infinite" } : {}),
        }}>
          {is_anomaly ? "⚠️" : "✅"}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: statusStyle.icon }}>{severity}</span>
            <span className={`badge ${statusStyle.badge}`}>
              {is_anomaly ? "ANOMALY DETECTED" : "NORMAL"}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{message}</p>
        </div>

        {score !== null && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2, textTransform: "uppercase" }}>Isolation Score</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: statusStyle.icon }}>{score}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>(-1 = anomaly)</div>
          </div>
        )}
      </div>

      {/* Flagged features */}
      {anomalous_features?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: 12, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            ⚡ Flagged Features (Z-score &gt; 2.0)
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {anomalous_features.map((f) => (
              <span key={f} className="badge badge-red">{featureLabels[f] || f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Info box */}
      <div style={{
        padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)",
        background: "#f8faff", fontSize: 12, color: "var(--text-muted)",
      }}>
        🤖 Algorithm: <strong style={{ color: "var(--text-secondary)" }}>Isolation Forest</strong> with contamination=10% — flags readings &gt; 2σ from historical baseline.
      </div>
    </div>
  );
}
