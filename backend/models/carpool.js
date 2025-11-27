const mongoose = require('mongoose');

const CarpoolSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleType: String,
  pickup: {
    address: String,
    coords: { type: { type: String, default: 'Point' }, coordinates: [Number] },
  },
  destination: {
    address: String,
    coords: { type: { type: String, default: 'Point' }, coordinates: [Number] },
  },
  routePolyline: String,
  totalSeats: Number,
  seatsRemaining: Number,
  pricePerSeat: Number,
  passengers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    seatsBooked: Number,
  }],
  status: { type: String, enum: ['open', 'closed', 'cancelled'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Carpool', CarpoolSchema);
