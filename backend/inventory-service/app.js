const express = require('express');
const redis = require('redis');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Kết nối tới Data Grid (Máy chạy Redis của nhóm)
const redisClient = redis.createClient({
    url: 'redis://172.16.69.195:6379' // Đảm bảo IP này khớp với máy chứa Redis
});

redisClient.on('error', (err) => console.log('Redis Error:', err));

redisClient.connect().then(() => {
    console.log("✅ Inventory PU kết nối với Data Grid (Redis)");
});

// 2. GET /stock/:productId - Kiểm tra tồn kho từ RAM (Data Grid)
app.get('/stock/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        const stock = await redisClient.get(`stock:${productId}`);
        res.json({ 
            productId, 
            stock: stock ? parseInt(stock) : 0 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. POST /stock/decrease - Trừ kho trực tiếp trên RAM (Cho Flash Sale)
// API này thường được Order Service gọi khi có người nhấn mua
app.post('/stock/decrease', async (req, res) => {
    const { productId, amount } = req.body;
    const key = `stock:${productId}`;

    try {
        // Kiểm tra số lượng hiện tại trên RAM
        const currentStock = await redisClient.get(key);
        
        if (!currentStock || parseInt(currentStock) < (amount || 1)) {
            return res.status(400).json({ message: "Hết hàng rồi!" });
        }

        // Dùng decrBy để trừ số lượng một cách Atomic (chống tranh chấp)
        const newStock = await redisClient.decrBy(key, amount || 1);
        
        console.log(`📉 Sản phẩm ${productId} vừa giảm tồn kho. Còn lại: ${newStock}`);
        res.json({ message: "Trừ kho thành công", remainingStock: newStock });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Port cho PU4 (theo tài liệu là 8084)
const PORT = 8084; 
app.listen(PORT, () => console.log(`🚀 Inventory PU chạy trên port ${PORT}`));