const express4 = require('express');
const router4 = express4.Router();
const { protect } = require('../middleware/auth');
const { updateLocation } = require('../controllers/locationController');


router4.post('/driver', protect, updateLocation); // driver sends live location


module.exports = router4;