import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";   // <-- Added
import { useState, useEffect } from "react";
import "./driverSidebar.css";

const DriverSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); // <-- Fix logout
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setSidebarOpen(false);
  };

  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    const handler = () => setSidebarOpen((v) => !v);
    window.addEventListener("toggleSidebar", handler);
    return () => window.removeEventListener("toggleSidebar", handler);
  }, []);

  return (
    <>
      {/* Hamburger Menu Icon */}
      {/* Hamburger Menu Icon (dispatches global toggle so header and sidebar stay in sync) */}
      <div
        className={`driver-sidebar-hamburger ${sidebarOpen ? "active" : ""}`}
        onClick={() => window.dispatchEvent(new CustomEvent("toggleSidebar"))}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Sidebar */}
      <div className={`driver-sidebar ${sidebarOpen ? "active" : ""}`}>
        <div>
          <h2 className="driver-logo">Ridezy Driver</h2>

          <ul className="driver-menu">
            <li className={isActive("/driver/dashboard") ? "active" : ""}>
              <Link to="/driver/dashboard" onClick={closeSidebar}>🏠 Dashboard</Link>
            </li>
            <li className={isActive("/driver/requests") ? "active" : ""}>
              <Link to="/driver/requests" onClick={closeSidebar}>📥 Ride Requests</Link>
            </li>
            <li className={isActive("/driver/active-ride") ? "active" : ""}>
              <Link to="/driver/active-ride" onClick={closeSidebar}>🚗 Active Ride</Link>
            </li>
            <li className={isActive("/driver/earnings") ? "active" : ""}>
              <Link to="/driver/earnings" onClick={closeSidebar}>💰 Earnings</Link>
            </li>
            <li className={isActive("/driver/reviews") ? "active" : ""}>
              <Link to="/driver/reviews" onClick={closeSidebar}>⭐ Reviews</Link>
            </li>
            <li className={isActive("/driver/profile") ? "active" : ""}>
              <Link to="/driver/profile" onClick={closeSidebar}>👤 Profile</Link>
            </li>
          </ul>
        </div>

        {/* FIXED LOGOUT */}
        <button className="driver-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </>
  );
};

export default DriverSidebar;
