const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      vehicleNumber,
      vehicleModel,
    } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const finalRole = role === "driver" ? "driver" : "passenger";

    // create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: finalRole,
    });

    // if driver, create driver + vehicle
    if (finalRole === "driver") {
      const driver = await Driver.create({
        user: user._id,
        vehicleNumber: vehicleNumber || "",
        vehicleModel: vehicleModel || "",
      });

      if (vehicleNumber || vehicleModel) {
        const vehicle = await Vehicle.create({
          driver: driver._id,
          vehicleNumber: vehicleNumber || "",
          totalSeats: 4, // default can be changed
          model: vehicleModel || "",
        });
        driver.vehicle = vehicle._id;
        driver.seatsAvailable = vehicle.totalSeats;
        await driver.save();
      }
    }

    const token = signToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: finalRole,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Missing email or password' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    // Optional: verify role user selected matches stored role
    if (role && role !== user.role) {
      return res.status(403).json({ message: "Role mismatch" });
    }

    const token = signToken(user);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  res.json({ user: req.user });
};
