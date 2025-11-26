const express3 = require('express');
const router3 = express3.Router();
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');


// passenger specific endpoints (profile edit, history)
router3.use(protect);


router3.get('/profile', (req, res) => { res.json({ user: req.user }); });


module.exports = router3;