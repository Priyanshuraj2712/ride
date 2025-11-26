const mongoose4 = require('mongoose');


const RideSchema = new mongoose4.Schema({
rideType: { type: String, enum: ['carpool','cab_sharing','premium'], required: true },
createdBy: { type: mongoose4.Schema.Types.ObjectId, ref: 'User', required: true },
driver: { type: mongoose4.Schema.Types.ObjectId, ref: 'Driver' },
passengers: [{ user: { type: mongoose4.Schema.Types.ObjectId, ref: 'User' }, seatsBooked: Number }],
pickup: {
address: String,
coords: { type: { type: String, default: 'Point' }, coordinates: [Number] }, // [lng, lat]
},
destination: {
address: String,
coords: { type: { type: String, default: 'Point' }, coordinates: [Number] },
},
routePolyline: String,
price: Number,
totalSeats: Number,
seatsRemaining: Number,
status: { type: String, enum: ['pending','accepted','ongoing','completed','cancelled','rejected'], default: 'pending' },
otpStart: String,
otpEnd: String,
timestamps: {
requestedAt: { type: Date, default: Date.now },
acceptedAt: Date,
startedAt: Date,
endedAt: Date,
}
});


RideSchema.index({ 'pickup.coords': '2dsphere', 'destination.coords': '2dsphere' });


module.exports = mongoose4.model('Ride', RideSchema);