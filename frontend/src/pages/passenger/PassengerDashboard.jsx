import PassengerSidebar from "../../components/PassengerSidebar";
import "./passenger.css";

const PassengerDashboard = () => {
  return (
    <div className="passenger-layout">
      <PassengerSidebar />

      <div className="content-area">
        <h1>Welcome Passenger 👋</h1>
        <p>Select any option from the sidebar.</p>
      </div>
    </div>
  );
};

export default PassengerDashboard;
