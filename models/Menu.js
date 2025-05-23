const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  image: { type: String },
  location: { type: String, required: true },
  price: { type: Number, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Menu', menuItemSchema);