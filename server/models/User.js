// server/models/User.js
const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  name: String,
  url: {type: String, unique: true},
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', urlSchema);