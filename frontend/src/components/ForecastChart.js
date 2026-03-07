import React, { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from "recharts";

const METRICS = [
  { key: "temperature", label: "Temp (°C)", color: "#dc2626", nextKey: "next_temperature" },
  { key: "humidity",    label: "Humidity (%)", color: "#1a56db", nextKey: "next_humidity" },
  { key: "ph",          label: "pH", color: "#16a34a", nextKey: "next_ph" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: "#fff", border: "1px solid #dce6f7", borderRadius: 8,
        padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}>
        <p style={{ color: "var(--text-muted)", marginBottom: 5, fontSize: 11 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color, fontWeight: 600, fontSize: 13 }}>
            {p.name}: {Number(p.value).toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ForecastChart({ history, forecast }) {
  const [selected, setSelected] = useState(METRICS[0]);

  if (!history || history.length < 2) {
    return (
      <div style={{
        textAlign: "center", padding: 48, color: "var(--text-muted)",
        background: "#f8faff", borderRadius: 10, border: "2px dashed var(--border)",
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
        <div style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Collecting data for forecast…</div>
        <div style={{ fontSize: 12, marginTop: 6 }}>Need at least 2 readings. Auto-refreshing every 8s.</div>
      </div>
    );
  }

  const chartData = history.slice(-20).map((h, i) => ({
    name: `#${i + 1}`,
    [selected.key]: Number(h[selected.key]?.toFixed(2)),
  }));

  const nextVal = forecast?.[selected.nextKey];
  if (nextVal != null) {
    const lastActual = chartData[chartData.length - 1]?.[selected.key];
    chartData.push({
      name: "Next",
      [selected.key]: lastActual,
      predicted: Number(nextVal?.toFixed(2)),
    });
  }

  return (
    <div>
      {/* Metric pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {METRICS.map((m) => (
          <button key={m.key} onClick={() => setSelected(m)}
            style={{
              padding: "7px 18px", borderRadius: 99, cursor: "pointer",
              background: selected.key === m.key ? m.color : "#fff",
              color: selected.key === m.key ? "#fff" : "var(--text-secondary)",
              border: `1px solid ${selected.key === m.key ? m.color : "var(--border)"}`,
              fontWeight: 600, fontSize: 12, transition: "all 0.2s ease",
            }}>
            {m.label}
          </button>
        ))}
        {forecast && (
          <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-secondary)" }}>
            Next predicted: <strong style={{ color: selected.color }}>
              {forecast[selected.nextKey]?.toFixed(2)}
            </strong>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
          <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
          <Line type="monotone" dataKey={selected.key} name={selected.label}
            stroke={selected.color} strokeWidth={2.5}
            dot={{ r: 3, fill: selected.color, stroke: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 6 }} />
          {nextVal != null && (
            <Line type="monotone" dataKey="predicted" name="Predicted"
              stroke={selected.color} strokeWidth={2} strokeDasharray="6 4"
              dot={{ r: 6, fill: "#fff", stroke: selected.color, strokeWidth: 2 }} />
          )}
          <ReferenceLine x="Next" stroke="#cbd5e1" strokeDasharray="4 4"
            label={{ value: "Forecast", fill: "#94a3b8", fontSize: 11 }} />
        </LineChart>
      </ResponsiveContainer>

      {forecast && (
        <div style={{
          marginTop: 14, padding: "10px 14px", borderRadius: 8,
          background: "#f8faff", border: "1px solid var(--border)",
          fontSize: 12, color: "var(--text-secondary)",
        }}>
          📊 Based on <strong style={{ color: "var(--text-primary)" }}>{forecast.based_on_readings}</strong> readings. {forecast.note}
        </div>
      )}
    </div>
  );
}
