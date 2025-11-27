const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/profile', (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
