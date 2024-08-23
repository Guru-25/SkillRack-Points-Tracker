const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  id: String,
  name: String,
  dept: String,
  url: {type: String, unique: true},
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', urlSchema);