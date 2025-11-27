import DriverSidebar from "../../components/DriverSidebar";
import "./driver.css";

const Earnings = () => {
  const summary = {
    today: "₹850",
    week: "₹4,200",
    month: "₹18,750",
  };

  return (
    <div className="driver-layout">
      <DriverSidebar />
      <div className="driver-main">
        <div className="driver-topbar">
          <h1>Earnings</h1>
        </div>

        <div className="driver-stats-grid">
          <div className="driver-card">
            <h3>Today</h3>
            <p className="driver-card-number">{summary.today}</p>
          </div>
          <div className="driver-card">
            <h3>This Week</h3>
            <p className="driver-card-number">{summary.week}</p>
          </div>
          <div className="driver-card">
            <h3>This Month</h3>
            <p className="driver-card-number">{summary.month}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
