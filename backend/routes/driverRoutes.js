const express2 = require('express');``
const router8 = express2.Router();
router8.get(
  "/me",
  protect,
  authorizeRoles("driver"),
  async (req, res) => {
    try {
      const driver = await DriverModel.findOne({ user: req.user._id })
        .populate("vehicle")
        .populate("user", "name email phone");

      if (!driver)
        return res.status(404).json({ message: "Driver not found" });

      res.json({ driver });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);
