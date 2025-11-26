const mongoose5 = require('mongoose');


const CarpoolSchema = new mongoose5.Schema({
createdBy: { type: mongoose5.Schema.Types.ObjectId, ref: 'User', required: true },
vehicleType: String,
pickup: { address: String, coords: { type: { type: String, default: 'Point' }, coordinates: [Number] } },
destination: { address: String, coords: { type: { type: String, default: 'Point' }, coordinates: [Number] } },
routePolyline: String,
totalSeats: Number,
seatsRemaining: Number,
pricePerSeat: Number,
passengers: [{ user: { type: mongoose5.Schema.Types.ObjectId, ref: 'User' }, seatsBooked: Number }],
status: { type: String, enum: ['open','closed','cancelled'], default: 'open' },
createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose5.model('Carpool', CarpoolSchema);