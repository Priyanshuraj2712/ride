const mongoose6 = require('mongoose');


const LocationSchema = new mongoose6.Schema({
user: { type: mongoose6.Schema.Types.ObjectId, ref: 'User' },
driver: { type: mongoose6.Schema.Types.ObjectId, ref: 'Driver' },
coords: { type: { type: String, default: 'Point' }, coordinates: [Number] },
timestamp: Date
});


LocationSchema.index({ coords: '2dsphere' });


module.exports = mongoose6.model('Location', LocationSchema);