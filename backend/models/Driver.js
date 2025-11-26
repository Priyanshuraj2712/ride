const mongoose2 = require('mongoose');


const DriverSchema = new mongoose2.Schema({
user: { type: mongoose2.Schema.Types.ObjectId, ref: 'User', required: true },
vehicle: { type: mongoose2.Schema.Types.ObjectId, ref: 'Vehicle' },
online: { type: Boolean, default: false },
liveLocation: {
type: { type: String, enum: ['Point'], default: 'Point' },
coordinates: { type: [Number], default: [0,0] }, // [lng, lat]
updatedAt: Date,
},
seatsAvailable: { type: Number, default: 0 },
rideHistory: [{ type: mongoose2.Schema.Types.ObjectId, ref: 'Ride' }]
});


DriverSchema.index({ liveLocation: '2dsphere' });


module.exports = mongoose2.model('Driver', DriverSchema);