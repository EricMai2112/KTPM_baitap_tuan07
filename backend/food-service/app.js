const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Food = require('./src/models/Food');

const app = express();
app.use(cors()); // Cấu hình CORS để các máy khác gọi được IP LAN 
app.use(express.json());

// 1. Kết nối MongoDB Atlas
mongoose.connect("mongodb+srv://thanh:thanh123@cluster0.rnxpddi.mongodb.net/mini-food-order?appName=Cluster0")
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    seedData(); // Gọi hàm tạo dữ liệu mẫu [cite: 60]
  })
  .catch(err => console.error("Could not connect to MongoDB", err));

// 2. Hàm Seed dữ liệu mẫu theo yêu cầu [cite: 60]
async function seedData() {
  const count = await Food.countDocuments();
  if (count === 0) {
    const defaultFoods = [
      { name: "Cơm tấm", price: 35000, category: "Main", description: "Cơm tấm sườn bì chả" },
      { name: "Phở bò", price: 45000, category: "Main", description: "Phở bò truyền thống" },
      { name: "Trà đào", price: 20000, category: "Drink", description: "Trà đào cam sả" }
    ];
    await Food.insertMany(defaultFoods);
    console.log("Seed data created!");
  }
}

// 3. Định nghĩa các API [cite: 52-57]

// GET /foods - Xem danh sách món ăn [cite: 54]
app.get('/foods', async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /foods - Thêm món ăn mới [cite: 55]
app.post('/foods', async (req, res) => {
  const food = new Food(req.body);
  try {
    const newFood = await food.save();
    res.status(201).json(newFood);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /foods/:id - Sửa món ăn [cite: 56]
app.put('/foods/:id', async (req, res) => {
  try {
    const updatedFood = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedFood);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /foods/:id - Xóa món ăn [cite: 57]
app.delete('/foods/:id', async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = 8082;
app.listen(PORT, () => {
  console.log(`Food Service running on port ${PORT}`);
});