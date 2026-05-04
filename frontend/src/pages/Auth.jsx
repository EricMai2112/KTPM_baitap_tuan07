import { useState } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'USER' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // GỌI API ĐĂNG NHẬP
        const res = await userService.login({ 
          username: formData.username, 
          password: formData.password 
        });
        
        // res.data sẽ là chuỗi: "Đăng nhập thành công! Quyền của bạn là: USER"
        const responseText = res.data;
        
        // Trích xuất Role từ chuỗi trả về
        const userRole = responseText.includes("ADMIN") ? "ADMIN" : "USER";

        // Lưu thông tin vào Context (Tạo token giả vì Backend hiện tại chưa có JWT)
        login({ username: formData.username, role: userRole }, 'fake-jwt-token-123');
        
        alert("Đăng nhập thành công!");
        navigate('/');

      } else {
        // GỌI API ĐĂNG KÝ
        const res = await userService.register(formData);
        
        // res.data sẽ là chuỗi: "Đăng ký thành công! (Quyền: USER)"
        alert(res.data); 
        setIsLogin(true); // Chuyển sang form đăng nhập
      }
    } catch (err) {
      // Xử lý lỗi trả về từ Backend (VD: Lỗi 400 hoặc 401)
      if (err.response && err.response.data) {
        // In ra thông báo lỗi từ Spring Boot (VD: "Username đã tồn tại!" hoặc "Sai tài khoản...")
        alert(err.response.data); 
      } else {
        alert("Lỗi kết nối đến Server! Vui lòng kiểm tra lại Backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 drop-shadow-sm">
          {isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input 
            type="text" placeholder="Tên đăng nhập" required className="glass-input"
            value={formData.username}
            onChange={e => setFormData({...formData, username: e.target.value})}
          />
          <input 
            type="password" placeholder="Mật khẩu" required className="glass-input"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          
          {!isLogin && (
            <select 
              className="glass-input text-gray-700 font-medium cursor-pointer" 
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              <option value="USER">Khách hàng (USER)</option>
              <option value="ADMIN">Quản trị viên (ADMIN)</option>
            </select>
          )}

          <button type="submit" disabled={loading} className={`glass-button ${loading ? 'opacity-50' : ''}`}>
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập Ngay' : 'Đăng Ký')}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-700">
          {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} 
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)} 
            className="ml-2 font-bold text-indigo-700 hover:text-pink-600 hover:underline transition-colors"
          >
            {isLogin ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </p>
      </div>
    </div>
  );
}