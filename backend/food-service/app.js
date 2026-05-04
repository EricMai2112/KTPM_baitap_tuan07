const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const cors = require('cors');
require('dotenv').config();

const Food = require('./src/models/Food');
const app = express();
app.use(cors());
app.use(express.json());

// 1. Khởi tạo Redis Client (Data Grid)
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379' 
});

redisClient.on('error', err => console.error('❌ Redis Client Error', err));

// 2. Kết nối cả MongoDB và Redis
const connectSystems = async () => {
    try {
        // Kết nối MongoDB
        await mongoose.connect("mongodb+srv://thanh:thanh123@cluster0.rnxpddi.mongodb.net/mini-food-order?appName=Cluster0");
        console.log("✅ Connected to MongoDB Atlas");

        // Kết nối Redis
        await redisClient.connect();
        console.log("✅ Connected to Redis (Data Grid)");

        // Warm-up dữ liệu từ DB lên RAM ngay khi khởi động
        await warmUpCache();
    } catch (err) {
        console.error("❌ Connection Error:", err);
    }
};

// 3. Hàm nạp dữ liệu từ DB lên Redis (Space-Based Principle)
async function warmUpCache() {
  const foods = await Food.find();
  if (foods.length > 0) {
      for (const item of foods) {
          // Lưu thông tin sản phẩm
          await redisClient.set(`product:${item._id}`, JSON.stringify(item));
          // Lưu tồn kho riêng để PU4 có thể trừ kho real-time
          await redisClient.set(`stock:${item._id}`, item.stock.toString());
      }
      await redisClient.set('all_product_ids', JSON.stringify(foods.map(f => f._id)));
      console.log("🚀 Data Grid Warmed up: Products and Stock moved to RAM");
  }
}

// 4. Định nghĩa API cho PU1 - Product Processing Unit

// GET /products - Lấy từ Data Grid (Không đọc DB trực tiếp)[cite: 4]
app.get('/products', async (req, res) => {
    try {
        const cachedIds = await redisClient.get('all_product_ids');
        if (!cachedIds) return res.json([]);

        const ids = JSON.parse(cachedIds);
        const products = [];
        
        for (const id of ids) {
            // 1. Lấy object sản phẩm (chứa thông tin tên, giá, ảnh...)
            const productData = await redisClient.get(`product:${id}`);
            
            // 2. Lấy STOCK THỰC TẾ (mà Người 5 vừa trừ)
            const realTimeStock = await redisClient.get(`stock:${id}`);
            
            if (productData) {
                let product = JSON.parse(productData);
                // 3. Ghi đè số stock thực tế vào object trước khi gửi về Frontend
                product.stock = realTimeStock ? parseInt(realTimeStock) : 0;
                products.push(product);
            }
        }

        console.log("⚡ Đã cập nhật stock real-time từ Data Grid"); 
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /products/:id - Lấy chi tiết từ Cache[cite: 4]
app.get('/products/:id', async (req, res) => {
    try {
        const data = await redisClient.get(`product:${req.params.id}`);
        if (data) {
            console.log("⚡ Cache Hit!");
            return res.json(JSON.parse(data));
        }
        res.status(404).json({ message: "Không tìm thấy sản phẩm trên RAM" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = 8081; // Port cho PU1 theo tài liệu[cite: 4]
app.listen(PORT, async () => {
    await connectSystems();
    console.log(`Product PU running on port ${PORT}`);
});