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

    // compute basic stats to include with profile response
    try {
      const Ride = require("../models/Ride");
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const todaysCompleted = await Ride.find({
        driver: driver._id,
        status: 'completed',
        'timestamps.endedAt': { $gte: startOfDay, $lte: endOfDay },
      });

      const totalCompleted = await Ride.find({ driver: driver._id, status: 'completed' });

      const earningsToday = todaysCompleted.reduce((s, r) => s + (r.price || 0), 0);
      const earningsTotal = totalCompleted.reduce((s, r) => s + (r.price || 0), 0);

      const stats = {
        todaysRides: todaysCompleted.length,
        earningsToday,
        totalCompleted: totalCompleted.length,
        earningsTotal,
      };

      res.json({ user: driver.user, driver, stats });
      return;
    } catch (e) {
      console.error('Failed to compute driver stats (GET /me)', e);
      res.json({ user: driver.user, driver });
      return;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update driver profile (user + vehicle)
router.put("/me", protect, authorizeRoles("driver"), async (req, res) => {
  try {
    const { name, phone, vehicleNumber, model, totalSeats, color } = req.body;

    // update user
    if (name || phone) {
      await require("../models/User").findByIdAndUpdate(req.user._id, {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
      });
    }

    // update driver and vehicle
    const driver = await Driver.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    // update/create vehicle
    const Vehicle = require("../models/Vehicle");
    let vehicle = null;
    if (driver.vehicle) {
      vehicle = await Vehicle.findById(driver.vehicle);
      if (vehicle) {
        vehicle.vehicleNumber = vehicleNumber ?? vehicle.vehicleNumber;
        vehicle.model = model ?? vehicle.model;
        vehicle.totalSeats = totalSeats ?? vehicle.totalSeats;
        vehicle.color = color ?? vehicle.color;
        await vehicle.save();
      }
    } else if (vehicleNumber || model || totalSeats) {
      vehicle = await Vehicle.create({
        driver: driver._id,
        vehicleNumber: vehicleNumber || "",
        model: model || "",
        totalSeats: totalSeats || 4,
        color: color || "",
      });
      driver.vehicle = vehicle._id;
    }

    // optionally update driver fields
    if (vehicle) {
      driver.seatsAvailable = vehicle.totalSeats;
    }
    await driver.save();

    const updatedDriver = await Driver.findById(driver._id).populate("vehicle").populate("user", "name email phone");

    // compute basic stats: today's rides and earnings, totals
    try {
      const Ride = require("../models/Ride");
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const todaysCompleted = await Ride.find({
        driver: driver._id,
        status: 'completed',
        'timestamps.endedAt': { $gte: startOfDay, $lte: endOfDay },
      });

      const totalCompleted = await Ride.find({ driver: driver._id, status: 'completed' });

      const earningsToday = todaysCompleted.reduce((s, r) => s + (r.price || 0), 0);
      const earningsTotal = totalCompleted.reduce((s, r) => s + (r.price || 0), 0);

      const stats = {
        todaysRides: todaysCompleted.length,
        earningsToday,
        totalCompleted: totalCompleted.length,
        earningsTotal,
      };

      res.json({ user: updatedDriver.user, driver: updatedDriver, stats });
    } catch (e) {
      console.error('Failed to compute driver stats', e);
      res.json({ user: updatedDriver.user, driver: updatedDriver });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
