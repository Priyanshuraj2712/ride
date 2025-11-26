const mongoose3 = require('mongoose');


const VehicleSchema = new mongoose3.Schema({
driver: { type: mongoose3.Schema.Types.ObjectId, ref: 'Driver', required: true },
vehicleNumber: { type: String, required: true },
totalSeats: { type: Number, required: true },
model: String,
color: String,
});


module.exports = mongoose3.model('Vehicle', VehicleSchema);