const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const {
  updateVehicle,
  toggleOnline,
  getNearbyDrivers,
} = require('../controllers/driverController');

router.use(protect);

router.post('/vehicle', authorizeRoles('driver'), updateVehicle);
router.post('/online',  authorizeRoles('driver'), toggleOnline);
router.get('/nearby',   getNearbyDrivers);

module.exports = router;
