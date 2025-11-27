import { useEffect, useState } from "react";
import DriverSidebar from "../../components/DriverSidebar";
import axios from "../../services/api";
import "./driver.css";

const DriverReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1️⃣ Get driver profile → extract driverId
        const profileRes = await axios.get("/api/driver/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const driverId = profileRes.data.driver._id;

        // 2️⃣ Fetch all reviews for this driver
        const revRes = await axios.get(`/api/reviews/${driverId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReviews(revRes.data.reviews || []);
      } catch (err) {
        console.error("Review Load Error:", err);
      }

      setLoading(false);
    };

    loadReviews();
  }, []);

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div className="driver-layout">
      <DriverSidebar />
      <div className="driver-main">
        <div className="driver-topbar">
          <h1>Reviews</h1>
        </div>

        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div
              key={r._id}
              className="driver-upcoming-card"
              style={{ marginBottom: "10px" }}
            >
              <p>
                <strong>{r.userId?.name || "Passenger"}</strong> — {r.rating} ⭐
              </p>
              <p>{r.comment || "No comment"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverReviews;
