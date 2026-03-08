import React, { useState } from "react";
import SensorCard from "./SensorCard";
import CropHealth from "./CropHealth";
import NutrientDeficiency from "./NutrientDeficiency";
import IrrigationFert from "./IrrigationFert";
import ForecastChart from "./ForecastChart";
import AnomalyAlert from "./AnomalyAlert";
import FeatureImportance from "./FeatureImportance";

const TABS = [
  { id: "crop",       icon: "🌱", label: "Crop Health" },
  { id: "nutrient",   icon: "🧪", label: "Nutrient Deficiency" },
  { id: "irrigation", icon: "💧", label: "Irrigation & Fert" },
  { id: "forecast",   icon: "📈", label: "Forecast" },
  { id: "anomaly",    icon: "🔍", label: "Anomaly Detection" },
  { id: "features",   icon: "⚖️",  label: "Feature Importance" },
];

/* ── Loader ── */
function Loader() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16,
      background: "#f0f4ff",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "3px solid #dbeafe",
        borderTopColor: "#1a56db",
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ color: "#64748b", fontWeight: 500 }}>Connecting to VoltVortex backend…</div>
    </div>
  );
}

/* ── Error ── */
function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16,
      background: "#f0f4ff", padding: 24,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "#fee2e2", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 30,
      }}>⚡</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#dc2626" }}>Backend Unreachable</div>
      <p style={{ color: "#64748b", textAlign: "center", maxWidth: 380 }}>{message}</p>
      <button className="btn-primary" onClick={onRetry}>↻ Retry Connection</button>
    </div>
  );
}

export default function Dashboard({ data, history, loading, error, lastUpdated, onRefresh }) {
  const [activeTab, setActiveTab] = useState("crop");

  if (loading && !data) return <Loader />;
  if (error && !data)   return <ErrorBanner message={error} onRetry={onRefresh} />;

  const sensors   = data?.sensor_readings || {};
  const simulated = sensors.simulated_npk_ph;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff" }}>

      {/* ── Top Nav (like OpenDesk) ── */}
      <nav style={{
        background: "#ffffff",
        borderBottom: "1px solid #dce6f7",
        padding: "0 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60,
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 4px rgba(59,130,246,0.08)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "#1a56db",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>⚡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b", lineHeight: 1.2 }}>VoltVortex</div>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>Smart Farm Intelligence</div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {data?.anomaly?.is_anomaly
            ? <span className="badge badge-red">⚠️ Anomaly Detected</span>
            : data && <span className="badge badge-green">✅ All Normal</span>
          }
          {simulated && <span className="badge badge-yellow">⚡ pH/NPK Simulated</span>}
          {lastUpdated && (
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              🕐 {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button className="btn-primary" onClick={onRefresh} style={{ padding: "7px 16px", fontSize: 12 }}>
            ↻ Refresh
          </button>
        </div>
      </nav>

      {/* ── Hero strip (light blue, like OpenDesk) ── */}
      <div style={{
        background: "linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)",
        borderBottom: "1px solid #bfdbfe",
        padding: "22px 40px",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e3a8a", marginBottom: 2 }}>
                Farm Intelligence Dashboard
              </h1>
              <p style={{ fontSize: 12, color: "#3b82f6" }}>
                Real-time analytics powered by ARIES IoT sensor
                {data && ` · Device: ${data.device_id?.toUpperCase()} · History: ${history?.length || 0} readings`}
              </p>
            </div>
            {data?.timestamp && (
              <div style={{
                padding: "6px 14px", borderRadius: 8,
                background: "rgba(255,255,255,0.7)", border: "1px solid #bfdbfe",
                fontSize: 12, color: "#1a56db", fontWeight: 500,
              }}>
                Last reading: {new Date(data.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      <main style={{ padding: "28px 40px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Sensor cards grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}>
          <SensorCard label="Temperature"   value={sensors.temperature} unit="°C"    icon="🌡️" color="red"    />
          <SensorCard label="Humidity"      value={sensors.humidity}    unit="%"     icon="💧" color="blue"   />
          <SensorCard label="Soil Moisture" value={sensors.soil_moisture} unit="ADC" icon="🪴" color="cyan"   />
          <SensorCard label="pH Level"      value={sensors.ph}          unit=""      icon="⚗️" color="teal"   simulated={simulated} />
          <SensorCard label="Nitrogen (N)"  value={sensors.N}           unit="mg/kg" icon="🟢" color="green"  simulated={simulated} />
          <SensorCard label="Phosphorus (P)" value={sensors.P}          unit="mg/kg" icon="🔵" color="purple" simulated={simulated} />
          <SensorCard label="Potassium (K)" value={sensors.K}           unit="mg/kg" icon="🟠" color="orange" simulated={simulated} />
        </div>

        {/* ── Tabs (clean pill row like OpenDesk nav) ── */}
        <div style={{
          display: "flex", gap: 2, marginBottom: 20,
          background: "#fff", borderRadius: 12,
          border: "1px solid var(--border)",
          padding: 4,
          overflowX: "auto",
          boxShadow: "var(--shadow-sm)",
        }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 18px", borderRadius: 9, border: "none",
                  background: active ? "#1a56db" : "transparent",
                  color: active ? "#fff" : "#64748b",
                  cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500,
                  transition: "all 0.2s ease", whiteSpace: "nowrap",
                  boxShadow: active ? "0 2px 8px rgba(26,86,219,0.25)" : "none",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Analysis panel ── */}
        {data && (
          <div className="card animate-fadein" style={{ padding: "28px 32px" }}>
            {/* Panel header */}
            {(() => {
              const tab = TABS.find(t => t.id === activeTab);
              const descriptions = {
                crop:       "Random Forest classifier predicting plant stress from soil & environmental features.",
                nutrient:   "Rule-based analysis of N, P, K levels with targeted fertilization recommendations.",
                irrigation: "Threshold-based smart recommendations for when and how much to water/fertilize.",
                forecast:   "Linear trend projection of environmental & soil conditions for next reading.",
                anomaly:    "Isolation Forest flags unusual sensor readings that may indicate errors or extreme conditions.",
                features:   "Which factors drive crop stress most? Extracted from the Random Forest model.",
              };
              return (
                <div style={{
                  marginBottom: 24, paddingBottom: 16,
                  borderBottom: "1px solid var(--border)",
                  display: "flex", alignItems: "flex-start", gap: 10,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, background: "#dbeafe",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
                  }}>
                    {tab?.icon}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
                      {tab?.label}
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                      {descriptions[activeTab]}
                    </p>
                  </div>
                </div>
              );
            })()}

            {activeTab === "crop"       && <CropHealth data={data.crop_health} />}
            {activeTab === "nutrient"   && <NutrientDeficiency data={data.nutrient_deficiency} />}
            {activeTab === "irrigation" && <IrrigationFert data={data.irrigation_fertilization} />}
            {activeTab === "forecast"   && <ForecastChart history={history} forecast={data.forecast} />}
            {activeTab === "anomaly"    && <AnomalyAlert data={data.anomaly} />}
            {activeTab === "features"   && <FeatureImportance data={data.feature_importance} sensorData={sensors} recommendation={data.crop_recommendation} />}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 28, textAlign: "center", color: "#94a3b8", fontSize: 11 }}>
          VoltVortex · Powered by ARIES IoT · Auto-refresh every 8s
          {simulated && " · ⚡ pH and NPK are simulated (sensor not connected)"}
        </div>
      </main>
    </div>
  );
}
