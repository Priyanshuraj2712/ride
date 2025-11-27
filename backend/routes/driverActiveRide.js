const express = require("express");
const router = express.Router();
const { authorizeRoles } = require("../middleware/roles");
const { protect } = require("../middleware/auth");
const Ride = require("../models/Ride");
const Driver = require("../models/Driver");

// Get current active ride for logged-in driver
router.get("/active-ride", protect, authorizeRoles("driver"), async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });

    const ride = await Ride.findOne({
      driver: driver._id,
      status: { $in: ["accepted", "ongoing"] },
    }).populate("createdBy");

    res.json({ ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
