const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  googleId: { type: String, index: true, sparse: true },
  name: String,
  email: { type: String, index: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', UserSchema);
