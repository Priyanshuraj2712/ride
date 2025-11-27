const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/roles");
const Driver = require("../models/Driver");

// GET Driver Profile (driver + vehicle data)
router.get("/me", protect, authorizeRoles("driver"), async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id })
      .populate("vehicle")
      .populate("user", "name email phone");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json({ user: driver.user, driver });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
