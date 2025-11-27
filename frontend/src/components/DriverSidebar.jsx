import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";   // <-- Added
import "./driverSidebar.css";

const DriverSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); // <-- Fix logout

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="driver-sidebar">
      <h2 className="driver-logo">Ridezy Driver</h2>

      <ul className="driver-menu">
        <li className={isActive("/driver/dashboard") ? "active" : ""}>
          <Link to="/driver/dashboard">🏠 Dashboard</Link>
        </li>
        <li className={isActive("/driver/requests") ? "active" : ""}>
          <Link to="/driver/requests">📥 Ride Requests</Link>
        </li>
        <li className={isActive("/driver/active-ride") ? "active" : ""}>
          <Link to="/driver/active-ride">🚗 Active Ride</Link>
        </li>
        <li className={isActive("/driver/earnings") ? "active" : ""}>
          <Link to="/driver/earnings">💰 Earnings</Link>
        </li>
        <li className={isActive("/driver/reviews") ? "active" : ""}>
          <Link to="/driver/reviews">⭐ Reviews</Link>
        </li>
        <li className={isActive("/driver/profile") ? "active" : ""}>
          <Link to="/driver/profile">👤 Profile</Link>
        </li>
      </ul>

      {/* FIXED LOGOUT */}
      <button className="driver-logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default DriverSidebar;
