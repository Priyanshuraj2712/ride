import React, { useEffect, useState } from "react";
import DriverSidebar from "../../components/DriverSidebar";
import axios from "../../services/api";
import "./driver.css";

const DriverProfile = () => {
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("/api/driver/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Backend should return both
        setUser(res.data.user || null);
        setDriver(res.data.driver || null);
      } catch (err) {
        console.error("Profile load error:", err);
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="driver-layout">
      <DriverSidebar />

      <div className="driver-main">
        <div className="driver-topbar">
          <h1>Profile</h1>
        </div>

        <div className="driver-upcoming-card">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Phone:</strong> {user?.phone}</p>

          <hr />

          {driver?.vehicle ? (
            <>
              <p><strong>Vehicle No:</strong> {driver.vehicle.vehicleNumber}</p>
              <p><strong>Model:</strong> {driver.vehicle.model}</p>
              <p><strong>Seats:</strong> {driver.vehicle.totalSeats}</p>
              <p>
                <strong>Status:</strong>{" "}
                {driver.online ? (
                  <span style={{ color: "green" }}>Online</span>
                ) : (
                  <span style={{ color: "red" }}>Offline</span>
                )}
              </p>
            </>
          ) : (
            <p>No vehicle details available.</p>
          )}

          <div className="driver-upcoming-actions">
            <button className="driver-secondary-btn">Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
