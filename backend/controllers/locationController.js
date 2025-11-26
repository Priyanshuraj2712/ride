const Driver = require('../models/Driver');
const Location = require('../models/Location');


exports.updateLocation = async (req, res, next) => {
try {
const { latitude, longitude, timestamp } = req.body;
const driver = await Driver.findOne({ user: req.user._id });
if (!driver) return res.status(404).json({ message: 'Driver not found' });
driver.liveLocation = { type: 'Point', coordinates: [longitude, latitude], updatedAt: timestamp ? new Date(timestamp) : new Date() };
await driver.save();
await Location.create({ driver: driver._id, coords: { type: 'Point', coordinates: [longitude, latitude] }, timestamp: timestamp ? new Date(timestamp) : new Date() });
res.json({ success: true });
} catch (err) { next(err); }
};