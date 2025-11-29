import React, { useEffect, useState } from "react";
import axios from "../../services/api";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isDriver, setIsDriver] = useState(false);
  const [completedRides, setCompletedRides] = useState([]);
  const [ratingInputs, setRatingInputs] = useState({});

  // Extracted load so it can be called after review
  const load = async () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const driverId = localStorage.getItem("driverId");

    if (role === "driver" && driverId) {
      setIsDriver(true);
      try {
        const res = await axios.get(`/api/reviews/${driverId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(res.data.reviews || []);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // Passenger: fetch own rides and show completed rides with drivers
    try {
      const res = await axios.get(`/api/rides/user/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rides = res.data.rides || [];
      const completedWithDriver = rides.filter(
        (r) => r.status === "completed" && r.driver && (!r.rating && !r.review)
      );

      setCompletedRides(completedWithDriver);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const handleInputChange = (rideId, field, value) => {
    setRatingInputs((s) => ({ ...s, [rideId]: { ...(s[rideId] || {}), [field]: value } }));
  };

  const submitReview = async (rideId) => {
    const token = localStorage.getItem("token");
    const input = ratingInputs[rideId] || {};
    if (!input.rating) {
      alert("Please select a rating");
      return;
    }

    try {
      await axios.post(
        "/api/reviews",
        {
          rideId,
          rating: Number(input.rating),
          comment: input.comment || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Re-fetch rides to update review state
      await load();
      alert("Review submitted");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>⭐ Ratings & Reviews</h2>

      {isDriver ? (
        reviews.length === 0 ? (
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
        )
      ) : (
        <div>
          {completedRides.length === 0 ? (
            <p>No completed rides to review yet.</p>
          ) : (
            completedRides.map((ride) => (
              <div
                key={ride._id}
                style={{
                  padding: "15px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "15px",
                }}
              >
                <h3>Ride on {new Date(ride.timestamps?.endedAt || ride.timestamps?.requestedAt).toLocaleString()}</h3>
                <p>
                  <strong>Driver:</strong> {ride.driver?.user?.name || "Unknown"}
                </p>
                <p>
                  <strong>Vehicle:</strong> {ride.driver?.vehicleModel || ride.driver?.vehicleNumber || "N/A"}
                </p>

                <div style={{ marginTop: 8 }}>
                  <label>
                    Rating: 
                    <select value={ratingInputs[ride._id]?.rating || ""} onChange={(e) => handleInputChange(ride._id, 'rating', e.target.value)}>
                      <option value="">Select</option>
                      <option value="5">5</option>
                      <option value="4">4</option>
                      <option value="3">3</option>
                      <option value="2">2</option>
                      <option value="1">1</option>
                    </select>
                  </label>
                </div>

                <div style={{ marginTop: 8 }}>
                  <label>
                    Comment:
                    <br />
                    <textarea rows={3} style={{ width: '100%' }} value={ratingInputs[ride._id]?.comment || ''} onChange={(e) => handleInputChange(ride._id, 'comment', e.target.value)} />
                  </label>
                </div>

                <div style={{ marginTop: 10 }}>
                  <button onClick={() => submitReview(ride._id)}>Submit Review</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Reviews;
