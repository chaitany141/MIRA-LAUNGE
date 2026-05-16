const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  type: { type: String, enum: ['Catering', 'Decoration', 'Addon'], required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
