import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./sidebar.css";

const PassengerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <h2 className="logo">Ridezy</h2>

      <ul className="menu">
        <li className={isActive("/passenger/book") ? "active" : ""}>
          <Link to="/passenger/book">🚕 Book Ride</Link>
        </li>

        <li className={isActive("/passenger/rides") ? "active" : ""}>
          <Link to="/passenger/rides">📄 My Rides</Link>
        </li>

        <li className={isActive("/passenger/carpool") ? "active" : ""}>
          <Link to="/passenger/carpool">👥 Carpool</Link>
        </li>

        <li className={isActive("/passenger/live") ? "active" : ""}>
          <Link to="/passenger/live">📍 Live Tracking</Link>
        </li>

        <li className={isActive("/passenger/reviews") ? "active" : ""}>
          <Link to="/passenger/reviews">⭐ Ratings & Reviews</Link>
        </li>

        {/* FIXED LOGOUT BUTTON */}
        <li>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default PassengerSidebar;
