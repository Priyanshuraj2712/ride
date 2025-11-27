const Review = require("../models/Review");
const Ride = require("../models/Ride");
const Driver = require("../models/Driver");

// CREATE REVIEW
exports.createReview = async (req, res) => {
  try {
    const { rideId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!rideId || !rating) {
      return res.status(400).json({ message: "Ride ID and rating required" });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (!ride.driver) {
      return res.status(400).json({ message: "No driver associated with this ride" });
    }

    const driver = await Driver.findById(ride.driver);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    const review = await Review.create({
      rideId,
      driverId: ride.driver,
      userId,
      rating,
      comment,
    });

    // Update driver rating
    const allReviews = await Review.find({ driverId: ride.driver });
    const average =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    driver.rating = average;
    await driver.save();

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (err) {
    console.error("Review Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET DRIVER REVIEWS
exports.getDriverReviews = async (req, res) => {
  try {
    const { driverId } = req.params;

    const reviews = await Review.find({ driverId })
      .populate("userId", "name email")
      .populate("rideId");

    res.status(200).json({ success: true, reviews });
  } catch (err) {
    console.error("Get Reviews Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
