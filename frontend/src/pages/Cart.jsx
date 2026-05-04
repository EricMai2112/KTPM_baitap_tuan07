import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, paymentService } from '../services/api'; // Đã xóa inventoryService
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';

export default function Cart() {
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Frontend: Cart.js
const handleCheckout = async () => {
    setLoading(true);
    try {
        const currentCartId = localStorage.getItem('guest_cart_id');

        if (!currentCartId) {
            alert("Không tìm thấy phiên giỏ hàng của bạn!");
            setLoading(false);
            return;
        }

        const orderPayload = { 
            cartId: currentCartId 
        };

        const response = await orderService.createOrder(orderPayload);
        
        alert("Thanh toán thành công!");
        clearCart();
    } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.message || "Giỏ hàng trống hoặc hết hàng!";
        alert(`Lỗi: ${errorMsg}`);
    } finally {
        setLoading(false);
    }
  };

  // Giao diện khi giỏ hàng trống
  if (cart.length === 0) return (
    <div className="max-w-4xl mx-auto px-6 mt-20 text-center animate-fade-in-up">
      <div className="glass-panel p-12 flex flex-col items-center">
        <span className="text-6xl mb-4">🛒</span>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Giỏ hàng của bạn đang trống!</h2>
        <Link to="/" className="glass-button w-auto px-8 inline-flex items-center gap-2 text-lg">
          <ArrowLeft size={24} /> Quay lại chọn món
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="glass-panel p-8 shadow-2xl animate-fade-in-up">
        
        {/* Header Giỏ hàng & Nút Back */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-white/40 pb-5 gap-4">
          <h1 className="text-3xl font-black text-gray-900 drop-shadow-sm">Giỏ Hàng Của Bạn</h1>
          <Link to="/" className="flex items-center gap-2 text-indigo-800 hover:text-indigo-600 font-bold bg-white/30 px-4 py-2 rounded-lg transition-all hover:bg-white/50">
            <ArrowLeft size={20} /> Tiếp tục mua sắm
          </Link>
        </div>

        {/* Danh sách món ăn */}
        <div className="space-y-4 mb-8">
          {cart.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row justify-between items-center bg-white/30 hover:bg-white/40 transition-colors p-4 rounded-xl gap-4 border border-white/50 shadow-sm">
              
              <div className="flex-1 text-center sm:text-left">
                <p className="font-bold text-xl text-gray-900">{item.name}</p>
                <p className="text-indigo-800 font-medium">{item.price.toLocaleString()} đ / phần</p>
                {/* Hiển thị số lượng tồn kho */}
                {item.stock !== undefined && (
                  <p className="text-sm text-gray-600 mt-1 font-medium">
                    Tồn kho: <span className="text-pink-600">{item.stock}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6">
                {/* Cộng/Trừ số lượng */}
                <div className="flex items-center gap-3 bg-white/50 rounded-lg p-1 shadow-inner border border-white/60">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center bg-white/60 rounded hover:bg-white text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-8 text-center font-bold text-lg text-gray-900">{item.quantity}</span>
                  
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    disabled={item.stock !== undefined && item.quantity >= item.stock}
                    className="w-8 h-8 flex items-center justify-center bg-white/60 rounded hover:bg-white text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Tổng tiền & Nút Xóa */}
                <div className="flex items-center gap-4">
                  <p className="font-black text-indigo-900 text-xl min-w-[120px] text-right">
                    {(item.price * item.quantity).toLocaleString()} đ
                  </p>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 bg-red-100/50 hover:bg-red-200 p-2 rounded-lg transition-all"
                    title="Xóa món này"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tổng thanh toán */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/40">
          <span className="text-xl text-gray-800 font-bold uppercase tracking-wide">Tổng thanh toán:</span>
          <span className="text-4xl font-black text-pink-600 drop-shadow-md">{total.toLocaleString()} đ</span>
        </div>

        <button 
          onClick={handleCheckout} disabled={loading}
          className={`glass-button mt-8 text-xl py-4 uppercase tracking-wider ${loading ? 'opacity-50 cursor-wait' : ''}`}
        >
          {loading ? 'Đang xử lý giao dịch...' : 'Xác nhận Đặt hàng & Thanh toán'}
        </button>

      </div>
    </div>
  );
}