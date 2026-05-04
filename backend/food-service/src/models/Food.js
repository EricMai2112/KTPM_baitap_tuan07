const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  category: String,
  imageUrl: String
});

// Seed sẵn dữ liệu theo yêu cầu bài tập 
module.exports = mongoose.model('Food', foodSchema);