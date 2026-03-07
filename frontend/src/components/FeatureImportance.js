import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList
} from "recharts";

const FEATURE_LABELS = {
  N: "Nitrogen (N)", P: "Phosphorus (P)", K: "Potassium (K)",
  temperature: "Temperature", humidity: "Humidity",
  ph: "pH Level", soil_moisture: "Soil Moisture",
};

const COLORS = ["#1a56db","#16a34a","#ea580c","#7c3aed","#dc2626","#ca8a04","#0891b2"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: "#fff", border: "1px solid #dce6f7", borderRadius: 8,
        padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}>
        <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>
          {payload[0].payload.featureLabel}
        </p>
        <p style={{ color: payload[0].fill, fontWeight: 600 }}>
          Importance: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

export default function FeatureImportance({ data }) {
  if (!data?.length) return null;

  const chartData = data.map((d, i) => ({
    ...d,
    featureLabel: FEATURE_LABELS[d.feature] || d.feature,
    color: COLORS[i % COLORS.length],
  }));
  const top = chartData[0];

  return (
    <div>
      {/* Trophy banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, marginBottom: 24,
        padding: "14px 18px", borderRadius: 10,
        background: "#dbeafe", border: "1px solid #93c5fd",
      }}>
        <span style={{ fontSize: 26 }}>🏆</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
            Most Impactful Feature: <span style={{ color: top.color }}>{top.featureLabel}</span>
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: 12 }}>
            Contributes <strong style={{ color: top.color }}>{top.importance}%</strong> to crop stress prediction
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 60, left: 10, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="#e2e8f0" strokeDasharray="4 4" />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="featureLabel"
            tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
            axisLine={false} tickLine={false} width={110} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0f4ff" }} />
          <Bar dataKey="importance" radius={[0, 6, 6, 0]} maxBarSize={24}>
            {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
            <LabelList dataKey="importance" position="right"
              formatter={(v) => `${v}%`}
              style={{ fill: "#475569", fontSize: 12, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Chip legend */}
      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {chartData.map((d) => (
          <div key={d.feature} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 999,
            background: "#f8faff", border: "1px solid var(--border)",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
            <span style={{ fontSize: 11, color: d.color, fontWeight: 600 }}>{d.featureLabel}</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.importance}%</span>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 14, padding: "10px 14px", borderRadius: 8,
        background: "#f8faff", border: "1px solid var(--border)",
        fontSize: 12, color: "var(--text-muted)",
      }}>
        🌲 Extracted from <strong style={{ color: "var(--text-secondary)" }}>Random Forest</strong> (100 trees). Higher = more influential.
      </div>
    </div>
  );
}
