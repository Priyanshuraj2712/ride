const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  coords: { type: { type: String, default: 'Point' }, coordinates: [Number] },
  timestamp: Date,
});

LocationSchema.index({ coords: '2dsphere' });

module.exports = mongoose.model('Location', LocationSchema);
