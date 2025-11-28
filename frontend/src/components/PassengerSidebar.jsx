import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import "./sidebar.css";

const PassengerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setSidebarOpen(false);
  };

  const closeSidebar = () => setSidebarOpen(false);

  // Listen for header toggle event so header and sidebar stay in sync
  useEffect(() => {
    const handler = () => setSidebarOpen((v) => !v);
    window.addEventListener("toggleSidebar", handler);
    return () => window.removeEventListener("toggleSidebar", handler);
  }, []);

  return (
    <>
      {/* Hamburger Menu Icon (dispatches global toggle so header and sidebar stay in sync) */}
      <div
        className={`sidebar-hamburger ${sidebarOpen ? "active" : ""}`}
        onClick={() => window.dispatchEvent(new CustomEvent("toggleSidebar"))}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <h2 className="logo">Ridezy</h2>

        <ul className="menu">
          <li className={isActive("/passenger/book") ? "active" : ""}>
            <Link to="/passenger/book" onClick={closeSidebar}>🚕 Book Ride</Link>
          </li>

          <li className={isActive("/passenger/rides") ? "active" : ""}>
            <Link to="/passenger/rides" onClick={closeSidebar}>📄 My Rides</Link>
          </li>

          <li className={isActive("/passenger/carpool") ? "active" : ""}>
            <Link to="/passenger/carpool" onClick={closeSidebar}>👥 Carpool</Link>
          </li>

          <li className={isActive("/passenger/live") ? "active" : ""}>
            <Link to="/passenger/live" onClick={closeSidebar}>📍 Live Tracking</Link>
          </li>

          <li className={isActive("/passenger/reviews") ? "active" : ""}>
            <Link to="/passenger/reviews" onClick={closeSidebar}>⭐ Ratings & Reviews</Link>
          </li>

          {/* FIXED LOGOUT BUTTON */}
          <li>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default PassengerSidebar;
