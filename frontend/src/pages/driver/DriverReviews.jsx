import DriverSidebar from "../../components/DriverSidebar";
import "./driver.css";

const DriverReviews = () => {
  const reviews = [
    { id: 1, name: "Aman", rating: 5, comment: "Very polite and on time." },
    { id: 2, name: "Riya", rating: 4, comment: "Smooth ride, clean car." },
  ];

  return (
    <div className="driver-layout">
      <DriverSidebar />
      <div className="driver-main">
        <div className="driver-topbar">
          <h1>Reviews</h1>
        </div>

        {reviews.map((r) => (
          <div key={r.id} className="driver-upcoming-card" style={{ marginBottom: "10px" }}>
            <p><strong>{r.name}</strong> — {r.rating} ⭐</p>
            <p>{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverReviews;
