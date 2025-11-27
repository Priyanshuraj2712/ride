const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  rideId:   { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },

  rating:   { type: Number, min: 1, max: 5, required: true },
  comment:  { type: String },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", ReviewSchema);
