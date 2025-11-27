import DriverSidebar from "../../components/DriverSidebar";
import "./driver.css";

const RideRequests = () => {
  // static demo list for now
  const requests = [
    { id: 1, pickup: "Sector 14", drop: "Cyber Hub", fare: "₹250" },
    { id: 2, pickup: "MG Road", drop: "Udyog Vihar", fare: "₹180" },
  ];

  return (
    <div className="driver-layout">
      <DriverSidebar />
      <div className="driver-main">
        <div className="driver-topbar">
          <h1>Ride Requests</h1>
        </div>

        {requests.map((r) => (
          <div key={r.id} className="driver-upcoming-card" style={{ marginBottom: "10px" }}>
            <p><strong>Pickup:</strong> {r.pickup}</p>
            <p><strong>Drop:</strong> {r.drop}</p>
            <p><strong>Fare:</strong> {r.fare}</p>
            <div className="driver-upcoming-actions">
              <button className="driver-primary-btn">Accept</button>
              <button className="driver-secondary-btn">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RideRequests;
