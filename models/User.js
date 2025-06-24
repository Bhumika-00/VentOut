const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  password: String,
  name: String,
  role: {
    type: String,
    enum: ['Talker', 'Listener'],
    required: true
  }
});

module.exports = mongoose.model('User', UserSchema);
