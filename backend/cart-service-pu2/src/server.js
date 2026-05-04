const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { redisClient, connectRedis } = require('./config/redis');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Cho phép Express đọc dữ liệu JSON từ Frontend gửi lên

// ==========================================
// API 1: POST /cart/add - Thêm vào giỏ hàng
// ==========================================
app.post('/cart/add', async (req, res) => {
    try {
        const { userId, productId, quantity, price } = req.body;

        if (!userId || !productId || !quantity) {
            return res.status(400).json({ error: 'Thiếu thông tin userId, productId hoặc quantity' });
        }

        const cartId = req.body.cartId || req.body.userId; // Dùng chung logic

        const cartKey = `cart:${cartId}`;
        
        // 1. Lấy giỏ hàng hiện tại của User từ Redis (Data Grid)
        const currentCartStr = await redisClient.get(cartKey);
        let cart = currentCartStr ? JSON.parse(currentCartStr) : [];

        // 2. Kiểm tra sản phẩm đã có trong giỏ chưa
        const existingItemIndex = cart.findIndex(item => item.productId === productId);

        if (existingItemIndex > -1) {
            // Nếu có rồi thì tăng số lượng
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Nếu chưa có thì thêm mới vào mảng
            cart.push({ productId, quantity, price });
        }

        // 3. Lưu lại giỏ hàng đã cập nhật vào Redis
        // Không gọi tới Database (MySQL/PostgreSQL) ở đây để đảm bảo tốc độ cực nhanh cho Flash Sale
        await redisClient.set(cartKey, JSON.stringify(cart));

        res.status(200).json({ 
            message: 'Đã thêm vào giỏ hàng thành công (Lưu trên Data Grid)',
            cart: cart 
        });

    } catch (error) {
        console.error('Lỗi khi thêm vào giỏ hàng:', error);
        res.status(500).json({ error: 'Lỗi server (Processing Unit 2)' });
    }
});

// ==========================================
// API 2: GET /cart/:userId - Xem giỏ hàng
// ==========================================
app.get('/cart/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const cartKey = `cart:${userId}`;

        // Đọc trực tiếp từ RAM (Redis)
        const cartStr = await redisClient.get(cartKey);
        
        if (!cartStr) {
            return res.status(200).json({ message: 'Giỏ hàng trống', cart: [] });
        }

        res.status(200).json({ cart: JSON.parse(cartStr) });

    } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng:', error);
        res.status(500).json({ error: 'Lỗi server (Processing Unit 2)' });
    }
});

// ==========================================
// Khởi chạy Service (Processing Unit)
// ==========================================
const PORT = process.env.PORT || 8082;

app.listen(PORT, async () => {
    await connectRedis(); // Mở kết nối tới Redis khi server khởi động
    console.log(`🚀 Cart Processing Unit (PU2) đang chạy tại http://localhost:${PORT}`);
    console.log(`Kiến trúc: Space-Based Architecture - Flash Sale Ready!`);
});