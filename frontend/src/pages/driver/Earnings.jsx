import React, { useEffect, useState } from "react";
import DriverSidebar from "../../components/DriverSidebar";
import axios from "../../services/api";
import "./driver.css";

const Earnings = () => {
  const [summary, setSummary] = useState({
    today: 0,
    week: 0,
    month: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("/api/driver/earnings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSummary({
          today: res.data.today ?? 0,
          week: res.data.week ?? 0,
          month: res.data.month ?? 0,
        });
      } catch (err) {
        console.error("Earnings Load Error:", err);
        alert("Failed to load earnings");
      }

      setLoading(false);
    };

    loadEarnings();
  }, []);

  if (loading) return <p>Loading earnings...</p>;

  return (
    <div className="driver-layout">
      <DriverSidebar />

      <div className="driver-main">
        <div className="driver-topbar">
          <h1>Earnings</h1>
        </div>

        <div className="driver-stats-grid">
          <div className="driver-card">
            <h3>Today</h3>
            <p className="driver-card-number">₹{summary.today}</p>
          </div>

          <div className="driver-card">
            <h3>This Week</h3>
            <p className="driver-card-number">₹{summary.week}</p>
          </div>

          <div className="driver-card">
            <h3>This Month</h3>
            <p className="driver-card-number">₹{summary.month}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
