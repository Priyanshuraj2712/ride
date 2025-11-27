const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  driver:        { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  vehicleNumber: { type: String, required: true },
  totalSeats:    { type: Number, required: true },
  model: String,
  color: String,
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
