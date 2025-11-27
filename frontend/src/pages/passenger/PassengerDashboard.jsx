import PassengerSidebar from "../../components/PassengerSidebar";
import "./passenger.css";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

const PassengerDashboard = () => {

  const { auth } = useAuth();

  // Protect route
  if (!auth.token || auth.user.role !== "passenger") {
    return <Navigate to="/login" />;
  }

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
