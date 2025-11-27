const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle:{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  online: { type: Boolean, default: false },
  vehicleNumber: { type: String },
  vehicleModel:  { type: String },
  liveLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    updatedAt: Date,
  },
  seatsAvailable: { type: Number, default: 0 },
  rideHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ride' }],
  rating: { type: Number, default: 0 }, // ⭐ added
});

DriverSchema.index({ liveLocation: '2dsphere' });

module.exports = mongoose.model('Driver', DriverSchema);
