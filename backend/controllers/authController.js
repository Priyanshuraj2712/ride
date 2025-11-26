const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');


const signToken = (user) => {
return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};


exports.register = async (req, res, next) => {
try {
const { name, email, phone, password, role } = req.body;
if (!name || !email || !phone || !password) return res.status(400).json({ message: 'Missing fields' });
const user = await User.create({ name, email, phone, password, role });
// if driver role, create driver record too
if (role === 'driver') {
const driver = await Driver.create({ user: user._id });
user.driver = driver._id;
}
const token = signToken(user);
res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
} catch (err) {
next(err);
}
};


exports.login = async (req, res, next) => {
try {
const { email, password } = req.body;
if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
const user = await User.findOne({ email });
if (!user) return res.status(401).json({ message: 'Invalid credentials' });
const isMatch = await user.matchPassword(password);
if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
const token = signToken(user);
res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
} catch (err) { next(err); }
};


exports.getProfile = async (req, res, next) => {
const user = req.user;
res.json({ user });
};