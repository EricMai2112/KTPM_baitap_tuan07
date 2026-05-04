const express = require('express');
const redis = require('redis');
const cors = require('cors');
const axios = require('axios'); // Thêm axios để gọi service khác
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối Redis (Data Grid chung)
const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://172.16.69.195:6379'
});

redisClient.connect().then(() => console.log("✅ Order PU connected to Data Grid (Redis)"));

// POST /checkout - Xử lý điều phối đặt hàng Flash Sale
app.post('/checkout', async (req, res) => {
    const cartId = req.body.cartId || req.body.userId;
    console.log(`🔍 [Order PU] Processing Checkout for ID: ${cartId}`);
    
    try {
        const cartKey = `cart:${cartId}`;
        
        // 1. Lấy giỏ hàng từ RAM (Data Grid)
        const cartData = await redisClient.get(cartKey);
        if (!cartData) return res.status(400).json({ message: "Giỏ hàng trống!" });
        
        const items = JSON.parse(cartData);
        let totalAmount = 0;
        let orderDetails = [];

        // 2. Gọi Inventory PU (Người 5) để trừ kho từng món
        // Địa chỉ Người 5: http://172.16.69.166:8084
        for (const item of items) {
            try {
                const inventoryRes = await axios.post('http://172.16.69.166:8084/stock/decrease', {
                    productId: item.productId,
                    quantity: item.quantity
                });

                // Nếu Người 5 báo thành công, lấy thông tin giá để tính tổng
                const productData = await redisClient.get(`product:${item.productId}`);
                const product = JSON.parse(productData);
                
                totalAmount += product.price * item.quantity;
                orderDetails.push({ ...item, name: product.name, price: product.price });
                
            } catch (invErr) {
                // Nếu Người 5 báo lỗi (hết hàng hoặc lỗi mạng)
                const errorMsg = invErr.response?.data?.message || "Lỗi khi trừ tồn kho tại Inventory PU";
                console.error(`❌ Inventory Error: ${errorMsg}`);
                return res.status(400).json({ message: errorMsg });
            }
        }

        // 3. Sau khi trừ kho thành công, tạo đơn hàng lưu vào RAM
        const orderId = `order:${Date.now()}`;
        const orderInfo = {
            orderId,
            cartId,
            items: orderDetails,
            totalAmount,
            status: "SUCCESS",
            createdAt: new Date().toISOString()
        };

        await redisClient.set(orderId, JSON.stringify(orderInfo));

        // 4. Xóa giỏ hàng trên RAM
        await redisClient.del(cartKey);

        console.log(`✅ [Order PU] Order ${orderId} created successfully. Stock managed by Inventory PU.`);
        res.json({ message: "Đặt hàng Flash Sale thành công!", order: orderInfo });

    } catch (err) {
        console.error("❌ Order PU Error:", err);
        res.status(500).json({ error: "Lỗi hệ thống khi xử lý đơn hàng" });
    }
});

const PORT = 8083; 
app.listen(PORT, () => console.log(`🚀 Order PU running on port ${PORT}`));