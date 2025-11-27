const express6 = require('express');
const router6 = express6.Router();
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { requestRide, driverRespond, startRide, endRide, getRide, bookRide, estimateFare,myRides } = require('../controllers/rideController');


router6.post('/request', protect, authorizeRoles('passenger'), requestRide);
router6.post('/driver/respond', protect, authorizeRoles('driver'), driverRespond);
router6.post('/start', protect, startRide);

router6.post('/end', protect, endRide);
router6.get('/:id', protect, getRide);
router6.post('/estimate', protect, estimateFare);
router6.get('/my', protect, myRides);

module.exports = router6;