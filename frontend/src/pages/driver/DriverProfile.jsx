import React, { useEffect, useState } from "react";
import DriverSidebar from "../../components/DriverSidebar";
import axios from "../../services/api";
import "./driver.css";

const DriverProfile = () => {
  const [user, setUser] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

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
        setForm({
          name: res.data.user?.name || "",
          phone: res.data.user?.phone || "",
          vehicleNumber: res.data.driver?.vehicle?.vehicleNumber || "",
          model: res.data.driver?.vehicle?.model || "",
          totalSeats: res.data.driver?.vehicle?.totalSeats || "",
          color: res.data.driver?.vehicle?.color || "",
        });
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
          {!editing ? (
            <>
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
                {!editing ? (
                  <button className="driver-secondary-btn" onClick={() => setEditing(true)}>Edit Profile</button>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <label>
                Name
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label>
                Phone
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>

              <hr />

              <label>
                Vehicle Number
                <input
                  type="text"
                  value={form.vehicleNumber}
                  onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                />
              </label>
              <label>
                Model
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                />
              </label>
              <label>
                Total Seats
                <input
                  type="number"
                  value={form.totalSeats}
                  onChange={(e) => setForm({ ...form, totalSeats: e.target.value })}
                />
              </label>
              <label>
                Color
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
              </label>

              <div className="driver-upcoming-actions">
                <button
                  className="driver-primary-btn"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      const payload = {
                        name: form.name,
                        phone: form.phone,
                        vehicleNumber: form.vehicleNumber,
                        model: form.model,
                        totalSeats: form.totalSeats,
                        color: form.color,
                      };

                      // Update user fields via PUT (name, phone). Vehicle will be updated via dedicated endpoint.
                      try {
                        await axios.put(
                          "/api/driver/me",
                          { name: form.name, phone: form.phone },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                      } catch (e) {
                        // non-fatal, continue to attempt vehicle update
                        console.warn("Failed to update user info:", e?.response?.data || e.message);
                      }

                      // Update or create vehicle using dedicated endpoint
                      try {
                        await axios.post(
                          "/api/drivers/vehicle",
                          {
                            vehicleNumber: form.vehicleNumber,
                            totalSeats: Number(form.totalSeats) || 0,
                            model: form.model,
                            color: form.color,
                          },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                      } catch (e) {
                        console.warn("Vehicle update failed:", e?.response?.data || e.message);
                        throw e;
                      }

                      // Refresh profile
                      const refreshed = await axios.get("/api/driver/me", {
                        headers: { Authorization: `Bearer ${token}` },
                      });

                      setUser(refreshed.data.user);
                      setDriver(refreshed.data.driver);
                      setForm((f) => ({
                        ...f,
                        vehicleNumber: refreshed.data.driver?.vehicle?.vehicleNumber || "",
                        model: refreshed.data.driver?.vehicle?.model || "",
                        totalSeats: refreshed.data.driver?.vehicle?.totalSeats || "",
                        color: refreshed.data.driver?.vehicle?.color || "",
                      }));
                      setEditing(false);
                      alert("Profile updated");
                    } catch (err) {
                      console.error(err);
                      alert("Failed to update profile");
                    }
                  }}
                >
                  Save
                </button>
                <button className="driver-danger-btn" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </>
          )}

          

          
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
