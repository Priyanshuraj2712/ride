const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/roles");

const {
  requestRide,
  driverRespond,
  startRide,
  endRide,
  getRide,
  estimateFare,
  myRides,
  driverMyRides,
} = require("../controllers/rideController");

// Passenger creates/request ride
router.post("/request", protect, authorizeRoles("passenger"), requestRide);

// Driver accepts/rejects
router.post("/driver/respond", protect, authorizeRoles("driver"), driverRespond);

// OTP start
router.post("/start", protect, authorizeRoles("driver"), startRide);

// OTP end
router.post("/end", protect, authorizeRoles("driver"), endRide);

// Get a ride's full details
router.get("/:id", protect, getRide);

// Fare estimation
router.post("/estimate", protect, estimateFare);

// Passenger ride history
router.get("/user/my", protect, myRides);

// Driver: rides assigned to logged-in driver
router.get("/driver/my", protect, authorizeRoles("driver"), driverMyRides);

module.exports = router;
