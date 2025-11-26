const express2 = require('express');
const router2 = express2.Router();
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { updateVehicle, toggleOnline, getNearbyDrivers } = require('../controllers/driverController');


router2.use(protect);
router2.post('/vehicle', authorizeRoles('driver'), updateVehicle);
router2.post('/online', authorizeRoles('driver'), toggleOnline);
router2.get('/nearby', getNearbyDrivers); // optional: public or protected


module.exports = router2;