const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/roles");
const {
  createReview,
  getDriverReviews,
} = require("../controllers/reviewController");

router.post("/", protect, authorizeRoles("passenger"), createReview);
router.get("/:driverId", protect, getDriverReviews);

module.exports = router;
