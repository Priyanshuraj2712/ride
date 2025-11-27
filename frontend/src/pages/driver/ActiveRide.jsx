import DriverSidebar from "../../components/DriverSidebar";
import "./driver.css";

const ActiveRide = () => {
  return (
    <div className="driver-layout">
      <DriverSidebar />
      <div className="driver-main">
        <div className="driver-topbar">
          <h1>Active Ride</h1>
        </div>

        <div className="driver-upcoming-card">
          <p><strong>Passenger:</strong> Demo User</p>
          <p><strong>Pickup:</strong> HUDA City Centre</p>
          <p><strong>Drop:</strong> Golf Course Road</p>
          <p><strong>Status:</strong> On the way to drop</p>

          <div className="driver-upcoming-actions">
            <button className="driver-primary-btn">End Ride</button>
            <button className="driver-danger-btn">SOS</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveRide;
