const Ride = require('../models/Ride');
const DriverModel = require('../models/Driver');
const { generateOTP } = require('../utils/otp');
const { getETA } = require('../utils/googleDirections');
const VehicleModel = require('../models/Vehicle');

exports.estimateFare = async (req, res, next) => {
  try {
    const { pickup, destination } = req.body;

    if (!pickup?.coords || !destination?.coords) {
      return res.status(400).json({ message: 'pickup & destination coords required' });
    }

    const origin = {
      lat: pickup.coords.lat ?? pickup.coords.coordinates?.[1],
      lng: pickup.coords.lng ?? pickup.coords.coordinates?.[0],
    };
    const dest = {
      lat: destination.coords.lat ?? destination.coords.coordinates?.[1],
      lng: destination.coords.lng ?? destination.coords.coordinates?.[0],
    };

    if (origin.lat == null || origin.lng == null ||
        dest.lat == null || dest.lng == null) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    const route = await getETA(origin, dest);
    if (!route) return res.status(400).json({ message: 'Cannot calculate route' });

    const distanceMeters = route.distance.value || 0;
    const distanceKm = distanceMeters / 1000;
    const durationSec = route.duration.value || 0;
    const durationMin = durationSec / 60;

    // Fare logic
    const baseFare = 30;
    const perKm = 12;
    const perMin = 1;

    let fare = baseFare + (perKm * distanceKm) + (perMin * durationMin);
    fare = Math.round(fare * 100) / 100;

    return res.json({
      distance: route.distance,
      duration: route.duration,
      fare,
      polyline: route.polyline,
    });
  } catch (err) {
    next(err);
  }
};

// Passenger creates a cab or premium request
exports.requestRide = async (req, res, next) => {
  try {
    const { rideType, pickup, destination, totalSeats = 1, price } = req.body;

    if (!pickup?.coords || !destination?.coords) {
      return res.status(400).json({ message: 'pickup & destination coords required' });
    }

    const ride = await Ride.create({
      rideType,
      pickup,
      destination,
      totalSeats,
      seatsRemaining: totalSeats,
      price,
      createdBy: req.user._id,
      status: "pending",
    });

    // Find nearest online driver (support both GeoJSON 'coordinates' and plain {lat,lng})
    const lng = pickup.coords.lng ?? pickup.coords.coordinates?.[0];
    const lat = pickup.coords.lat ?? pickup.coords.coordinates?.[1];

    if (lng == null || lat == null) {
      return res.status(400).json({ message: 'Invalid pickup coordinates' });
    }

    const nearest = await DriverModel.find({
      online: true,
      seatsAvailable: { $gte: totalSeats },
      liveLocation: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 20000,
        },
      },
    }).limit(1);

    if (nearest.length) {
      ride.driver = nearest[0]._id;
      await ride.save();

      const io = req.app.get("io");
      const userSocketMap = req.app.get("userSocketMap");

      const driverSocketId = userSocketMap.get(nearest[0].user.toString());
      if (driverSocketId) {
        io.to(driverSocketId).emit("rideRequest", {
          rideId: ride._id,
          pickup: ride.pickup,
          destination: ride.destination,
        });
      }
    }

    return res.json({ success: true, ride });
  } catch (err) {
    next(err);
  }
};

exports.driverRespond = async (req, res, next) => {
  try {
    const { rideId, action } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    const driver = await DriverModel.findOne({ user: req.user._id });
    if (!driver || driver._id.toString() !== ride.driver?.toString())
      return res.status(403).json({ message: "Not authorized" });

    const io = req.app.get("io");
    const userSocketMap = req.app.get("userSocketMap");

    if (action === "accept") {
      ride.status = "accepted";
      ride.otpStart = generateOTP();
      ride.otpEnd = generateOTP();
      ride.timestamps.acceptedAt = new Date();
      await ride.save();

      const passengerSocket = userSocketMap.get(ride.createdBy.toString());
      if (passengerSocket)
        io.to(passengerSocket).emit("rideAssigned", { rideId: ride._id });

      return res.json({ success: true, ride });
    }

    // REJECT - clear current driver and attempt to reassign to next nearest
    // Keep ride pending so it can be re-broadcast
    const rejectingDriverId = driver._id;

    ride.status = "pending";
    ride.driver = null;
    await ride.save();

    try {
      // attempt to find next nearest driver (exclude rejecting driver)
      const lng = ride.pickup.coords.lng ?? ride.pickup.coords.coordinates?.[0];
      const lat = ride.pickup.coords.lat ?? ride.pickup.coords.coordinates?.[1];

      if (lng != null && lat != null) {
        const nearest = await DriverModel.find({
          _id: { $ne: rejectingDriverId },
          online: true,
          seatsAvailable: { $gte: ride.totalSeats },
          liveLocation: {
            $nearSphere: {
              $geometry: { type: "Point", coordinates: [lng, lat] },
              $maxDistance: 20000,
            },
          },
        }).limit(1);

        if (nearest.length) {
          ride.driver = nearest[0]._id;
          await ride.save();

          const driverSocketId = userSocketMap.get(nearest[0].user.toString());
          if (driverSocketId) {
            io.to(driverSocketId).emit("rideRequest", {
              rideId: ride._id,
              pickup: ride.pickup,
              destination: ride.destination,
            });
          }
        }
      }
    } catch (err) {
      console.error("Reassign after reject failed", err.message || err);
    }

    return res.json({ success: true, message: "Rejected" });
  } catch (err) {
    next(err);
  }
};

// Driver: get rides assigned to logged-in driver
exports.driverMyRides = async (req, res, next) => {
  try {
    const driver = await DriverModel.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    const rides = await Ride.find({ driver: driver._id })
      .sort({ "timestamps.requestedAt": -1 })
      .populate("createdBy", "name email")
      .populate("passengers.user", "name");

    res.json({ rides });
  } catch (err) {
    next(err);
  }
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
  } catch (err) {
    next(err);
  }
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
        if (vehicle) {
          driver.seatsAvailable = vehicle.totalSeats;
          await driver.save();
        }
      }
    }

    res.json({ ride });
  } catch (err) {
    next(err);
  }
};

exports.getRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver')
      .populate('passengers.user')
      .populate('createdBy');

    res.json({ ride });
  } catch (err) {
    next(err);
  }
};

exports.myRides = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const rides = await Ride.find({
      $or: [
        { createdBy: userId },
        { 'passengers.user': userId },
      ],
    }).sort({ 'timestamps.requestedAt': -1 });

    res.json({ rides });
  } catch (err) {
    next(err);
  }
};
