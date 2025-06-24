const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  talker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  listener: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
