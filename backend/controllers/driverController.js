const DriverModel = require('../models/Driver');
const VehicleModel = require('../models/Vehicle');

exports.updateVehicle = async (req, res, next) => {
  try {
    const driver = await DriverModel.findOne({ user: req.user._id });
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const { vehicleNumber, totalSeats, model, color } = req.body;

    let vehicle = await VehicleModel.findOne({ driver: driver._id });

    if (!vehicle) {
      vehicle = await VehicleModel.create({
        driver: driver._id,
        vehicleNumber,
        totalSeats,
        model,
        color,
      });
      driver.vehicle = vehicle._id;
    } else {
      vehicle.vehicleNumber = vehicleNumber || vehicle.vehicleNumber;
      vehicle.totalSeats = totalSeats || vehicle.totalSeats;
      vehicle.model = model || vehicle.model;
      vehicle.color = color || vehicle.color;
      await vehicle.save();
    }

    driver.seatsAvailable = vehicle.totalSeats;
    await driver.save();

    res.json({ vehicle, driver });
  } catch (err) {
    next(err);
  }
};

exports.toggleOnline = async (req, res, next) => {
  try {
    const driver = await DriverModel.findOne({ user: req.user._id }).populate('vehicle');
    if (!driver) return res.status(404).json({ message: 'Driver record not found' });

    driver.online = !!req.body.online;
    if (driver.vehicle) driver.seatsAvailable = driver.vehicle.totalSeats;
    await driver.save();

    res.json({ online: driver.online });
  } catch (err) {
    next(err);
  }
};

exports.getNearbyDrivers = async (req, res, next) => {
  try {
    const { lat, lng, radiusMeters = 5000 } = req.query;
    if (!lat || !lng)
      return res.status(400).json({ message: 'lat & lng required' });

    const drivers = await DriverModel.find({
      online: true,
      seatsAvailable: { $gt: 0 },
      liveLocation: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radiusMeters),
        },
      },
    })
      .limit(10)
      .populate('user vehicle');

    res.json({ drivers });
  } catch (err) {
    next(err);
  }
};
