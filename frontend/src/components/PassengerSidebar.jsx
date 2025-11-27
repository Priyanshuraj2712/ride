import { Link } from "react-router-dom";
import "./sidebar.css";

const PassengerSidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="logo">Ridezy</h2>

      <ul className="menu">
        <li><Link to="/passenger/book">🚕 Book Ride</Link></li>
        <li><Link to="/passenger/rides">📄 My Rides</Link></li>
        <li><Link to="/passenger/carpool">👥 Carpool</Link></li>
        <li><Link to="/passenger/live">📍 Live Tracking</Link></li>
        <li><Link to="/passenger/sos">🆘 SOS</Link></li>
        <li><Link to="/passenger/reviews">⭐ Ratings & Reviews</Link></li>
        <li><Link to="/login">🚪 Logout</Link></li>
      </ul>
    </div>
  );
};

export default PassengerSidebar;
