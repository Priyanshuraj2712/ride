import DriverSidebar from "../../components/DriverSidebar";
import "./driver.css";

const DriverProfile = () => {
  // later we can fetch real user details from backend
  const user = {
    name: "Demo Driver",
    email: "demo@driver.com",
    phone: "9876543210",
    vehicleNumber: "HR26 AB 1234",
    vehicleModel: "Hyundai i20",
  };

  return (
    <div className="driver-layout">
      <DriverSidebar />
      <div className="driver-main">
        <div className="driver-topbar">
          <h1>Profile</h1>
        </div>

        <div className="driver-upcoming-card">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Vehicle No:</strong> {user.vehicleNumber}</p>
          <p><strong>Vehicle Model:</strong> {user.vehicleModel}</p>

          <div className="driver-upcoming-actions">
            <button className="driver-secondary-btn">Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
