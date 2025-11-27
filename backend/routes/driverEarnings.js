const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/roles");
const Ride = require("../models/Ride");
const Driver = require("../models/Driver");

// GET driver earnings summary
router.get("/earnings", protect, authorizeRoles("driver"), async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek  = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const rides = await Ride.find({
      driver: driver._id,
      status: "completed",
    });

    const sum = (ridesArr, startDate) =>
      ridesArr
        .filter((r) => r.timestamps?.endedAt && new Date(r.timestamps.endedAt) >= startDate)
        .reduce((acc, r) => acc + (r.price || 0), 0);

    res.json({
      today: sum(rides, startOfToday),
      week:  sum(rides, startOfWeek),
      month: sum(rides, startOfMonth),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching earnings" });
  }
});

module.exports = router;
