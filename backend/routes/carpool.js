const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { createCarpool, joinCarpool, getAllCarpools,leaveCarpool } = require('../controllers/carpoolController');

router.post('/',         protect, authorizeRoles('passenger'), createCarpool);
router.post('/:id/join', protect, authorizeRoles('passenger'), joinCarpool);
router.get("/all", protect, getAllCarpools);
router.post("/:id/leave", protect, leaveCarpool);

module.exports = router;
