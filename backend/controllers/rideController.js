const Ride = require('../models/Ride');
const DriverModel = require('../models/Driver');
const { generateOTP } = require('../utils/otp');
const { getETA } = require('../utils/googleDirections');
const VehicleModel = require('../models/Vehicle');


exports.estimateFare = async (req, res, next) => {
try {
const { pickup, destination, totalSeats = 1 } = req.body;
// convert coords to { lat, lng }
const origin = { lat: pickup.coords.lat || pickup.coords.coordinates?.[1], lng: pickup.coords.lng || pickup.coords.coordinates?.[0] };
const dest = { lat: destination.coords.lat || destination.coords.coordinates?.[1], lng: destination.coords.lng || destination.coords.coordinates?.[0] };
const route = await getETA(origin, dest);
if (!route) return res.status(400).json({ message: 'Cannot calculate route' });
const distanceMeters = route.distance.value || (route.distance && route.distance.value) || 0;
const distanceKm = distanceMeters / 1000;
const durationSec = route.duration.value || 0;
const durationMin = durationSec / 60;


// fare logic (example)
const baseFare = 30; // ₹30 base
const perKm = 12; // ₹12/km
const perMin = 1; // ₹1/min
let fare = baseFare + (perKm * distanceKm) + (perMin * durationMin);
// premium multiplier
fare = Math.round(fare * 100) / 100;
return res.json({ distance: route.distance, duration: route.duration, fare, polyline: route.polyline });
} catch (err) { next(err); }
};


// Passenger creates a cab or premium request
exports.requestRide = async (req, res, next) => {
try {
const { rideType, pickup, destination, totalSeats, price } = req.body;
const ride = await Ride.create({
rideType,
createdBy: req.user._id,
pickup,
destination,
totalSeats: totalSeats || 1,
seatsRemaining: totalSeats || 1,
price
});


// if driver-based (cab_sharing or premium) find nearest driver
if (rideType === 'cab_sharing' || rideType === 'premium') {
// find nearest online driver
const lng = pickup.coords.coordinates[0];
const lat = pickup.coords.coordinates[1];
const nearest = await DriverModel.find({ online: true, seatsAvailable: { $gte: ride.totalSeats }, liveLocation: {
  $nearSphere: {
    $geometry: {
      type: 'Point',
      coordinates: [lng, lat]
    },
    $maxDistance: 20000
  }
}
 }).limit(1);
if (nearest && nearest.length) {
const driver = nearest[0];
// TODO: push request to driver (via socket or push). For now auto-assign pending acceptance
ride.driver = driver._id;
ride.status = 'pending';
await ride.save();
const io = req.app.get('io');
const userSocketMap = req.app.get('userSocketMap');
if (io && userSocketMap) {
const driverSocketId = userSocketMap.get(driver.user.toString());
if (driverSocketId) {
io.to(driverSocketId).emit('rideRequest', { rideId: ride._id, pickup: ride.pickup, destination: ride.destination, seats: ride.totalSeats });
}
}
return res.json({ ride, message: 'Driver found and requested (driver must accept)'});
}
}
res.json({ ride });
} catch (err) { next(err); }
};

exports.driverRespond = async (req, res, next) => {
try {
const { rideId, action } = req.body; // action: accept/reject
const ride = await Ride.findById(rideId);
if (!ride) return res.status(404).json({ message: 'Ride not found' });
if (!ride.driver) return res.status(400).json({ message: 'No driver assigned' });
const driver = await DriverModel.findOne({ user: req.user._id });
if (!driver || driver._id.toString() !== ride.driver.toString()) return res.status(403).json({ message: 'Not authorized' });
if (action === 'accept') {
ride.status = 'accepted';
if (io) {
io.to(`ride_${ride._id}`).emit('rideStatus', { status: 'accepted', rideId: ride._id });
// optionally notify passenger socket
const passengerSocketId = userSocketMap.get(ride.createdBy.toString());
if (passengerSocketId) io.to(passengerSocketId).emit('rideAssigned', { rideId: ride._id, driver: driver._id });
}
ride.timestamps.acceptedAt = new Date();
// generate OTPs
ride.otpStart = generateOTP();
ride.otpEnd = generateOTP();
await ride.save();
// reduce seats available for driver
driver.seatsAvailable -= ride.totalSeats;
await driver.save();
return res.json({ ride });
} else {
ride.status = 'rejected';
ride.driver = null;
await ride.save();
// attempt to auto-assign next nearest (simple implementation)
const lng = ride.pickup.coords.coordinates[0];
const lat = ride.pickup.coords.coordinates[1];
const next = await DriverModel.find({ online: true, seatsAvailable: { $gte: ride.totalSeats }, liveLocation: {
  $nearSphere: {
    $geometry: {
      type: 'Point',
      coordinates: [lng, lat]
    },
    $maxDistance: 20000
  }
}
 }).limit(1);
if (next && next.length) {
ride.driver = next[0]._id;
ride.status = 'pending';
await ride.save();
return res.json({ ride, message: 'Assigned next driver, pending acceptance' });
}
return res.json({ ride, message: 'No drivers available' });
}
} catch (err) { next(err); }
};

exports.startRide = async (req, res, next) => {
try {
const { rideId, otp } = req.body;
const ride = await Ride.findById(rideId);
if (!ride) return res.status(404).json({ message: 'Ride not found' });
if (ride.otpStart !== otp) return res.status(400).json({ message: 'Invalid OTP' });
ride.status = 'ongoing';
ride.timestamps.startedAt = new Date();
await ride.save();
res.json({ ride });
} catch (err) { next(err); }
};


exports.endRide = async (req, res, next) => {
try {
const { rideId, otp } = req.body;
const ride = await Ride.findById(rideId);
if (!ride) return res.status(404).json({ message: 'Ride not found' });
if (ride.otpEnd !== otp) return res.status(400).json({ message: 'Invalid OTP' });
ride.status = 'completed';
ride.timestamps.endedAt = new Date();
await ride.save();
// free up driver seats
if (ride.driver) {
const driver = await DriverModel.findById(ride.driver);
if (driver && driver.vehicle) {
const vehicle = await VehicleModel.findById(driver.vehicle);
driver.seatsAvailable = vehicle.totalSeats;
await driver.save();
}
}
res.json({ ride });
} catch (err) { next(err); }
};


exports.getRide = async (req, res, next) => {
try {
const ride = await Ride.findById(req.params.id).populate('driver passengers.user createdBy');
res.json({ ride });
} catch (err) { next(err); }
};

exports.myRides = async (req,res,next)=>{ const userId = req.user._id; const rides = await Ride.find({ $or: [{ createdBy: userId }, { 'passengers.user': userId }]}).sort({ 'timestamps.requestedAt': -1}); res.json({ rides }); }
