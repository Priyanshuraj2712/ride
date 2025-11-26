const express5 = require('express');
const router5 = express5.Router();
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { createCarpool, joinCarpool } = require('../controllers/carpoolController');


router5.post('/', protect, authorizeRoles('passenger'), createCarpool);
router5.post('/:id/join', protect, authorizeRoles('passenger'), joinCarpool);


module.exports = router5;