import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Dashboard from "./components/Dashboard";
import "./index.css";
import "./App.css";

const BACKEND = "http://localhost:5000";

export default function App() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      // 1. Fetch latest analyzed payload
      const res = await axios.get(`${BACKEND}/latest`);
      
      // If there's no data yet (empty server)
      if (!res.data || res.data.message === "No data available yet") {
        setAnalyticsData(null);
        setError("Waiting for first sensor reading from ARIES device...");
        setLoading(false);
        return;
      }

      setAnalyticsData(res.data);
      setLastUpdated(new Date());
      setError(null);

      // 2. Refresh history for charts
      const histRes = await axios.get(`${BACKEND}/history`);
      setHistory(histRes.data);
    } catch (err) {
      setError("Cannot reach VoltVortex backend. Make sure Flask is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Initial load
    // Poll every 5s for real sensor data updates
    intervalRef.current = setInterval(() => fetchData(), 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <Dashboard
      data={analyticsData}
      history={history}
      loading={loading}
      error={error}
      lastUpdated={lastUpdated}
      onRefresh={fetchData}
    />
  );
}