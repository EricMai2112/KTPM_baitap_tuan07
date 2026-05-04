import { createContext, useState, useContext, useEffect } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useAuth(); // Lấy thông tin user để biết userId

  // Hàm tạo hoặc lấy ID định danh cho khách (Guest) hoặc User
  const getCartUserId = () => {
    if (user && user.id) return user.id;
    if (user && user.username) return user.username;
    
    // Nếu chưa đăng nhập, lưu 1 mã định danh vào localStorage để dùng tạm
    let guestId = localStorage.getItem('guest_cart_id');
    if (!guestId) {
      guestId = 'guest_' + Math.floor(Math.random() * 100000);
      localStorage.setItem('guest_cart_id', guestId);
    }
    return guestId;
  };

  // HÀM ĐÃ ĐƯỢC CẬP NHẬT: Thêm vào giỏ và gọi PU2 (Data Grid)
  const addToCart = async (food) => {
    
    // 1. Lọc kiểm tra tồn kho & Cập nhật State (Giao diện React) ngay lập tức
    setCart(prev => {
      const exist = prev.find(i => i.id === food.id);
      if (exist) {
        if (food.stock !== undefined && exist.quantity >= food.stock) {
          alert(`Xin lỗi, món này chỉ còn ${food.stock} phần!`);
          return prev; 
        }
        return prev.map(i => i.id === food.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      
      if (food.stock !== undefined && food.stock <= 0) {
        alert(`Xin lỗi, món này đã hết hàng!`);
        return prev;
      }
      return [...prev, { ...food, quantity: 1 }];
    });

    // 2. GỌI API LÊN CART PROCESSING UNIT (PU2)
    try {
      const userId = getCartUserId();
      const payload = {
        userId: userId,
        productId: food.id || food._id,
        quantity: 1,
        price: food.price
      };

      // Đẩy dữ liệu thẳng vào RAM (Redis Data Grid) qua Node.js Service
      await cartService.addToCart(payload);
      // console.log(`Đã đẩy SP ${payload.productId} vào Redis cho User ${userId}`);
      
    } catch (error) {
      console.error("Lỗi khi đồng bộ giỏ hàng lên Redis Data Grid:", error);
      // Trong thực tế, có thể rollback (hoàn tác) state giao diện nếu API lỗi
    }
  };

  // Tăng/giảm số lượng
  const updateQuantity = (id, amount) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + amount;
        if (item.stock !== undefined && newQuantity > item.stock) {
          return { ...item, quantity: item.stock };
        }
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 }; 
      }
      return item;
    }));
    // Tương lai: Có thể gọi API PUT lên PU2 ở đây để đồng bộ Redis
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    // Tương lai: Gọi API DELETE /cart/item lên PU2
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);