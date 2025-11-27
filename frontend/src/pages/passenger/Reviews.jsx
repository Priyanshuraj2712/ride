import React, { useEffect, useState } from "react";
import axios from "../../services/api";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isDriver, setIsDriver] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const driverId = localStorage.getItem("driverId");

      if (role !== "driver" || !driverId) return;

      setIsDriver(true);

      try {
        const res = await axios.get(`/api/reviews/${driverId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReviews(res.data.reviews);
      } catch (err) {
        console.error(err);
      }
    };

    loadReviews();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>⭐ Ratings & Reviews</h2>

      {!isDriver ? (
        <p>Passengers can rate drivers after completing rides.</p>
      ) : reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {reviews.map((rev) => (
            <div
              key={rev._id}
              style={{
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <h3>⭐ {rev.rating}/5</h3>
              <p>
                <strong>Passenger:</strong> {rev.userId?.name}
              </p>
              <p>{rev.comment || "No comment added"}</p>
              <small>{new Date(rev.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
