import { useEffect, useState } from 'react';
import { foodService, orderService } from '../services/api';

export default function AdminFood() {
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Tải danh sách món ăn và đơn hàng
    foodService.getFoods().then(res => setFoods(res.data)).catch(() => {});
    orderService.getOrders().then(res => setOrders(res.data)).catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm("Xóa món này?")) {
      await foodService.deleteFood(id); // [cite: 57]
      setFoods(foods.filter(f => f.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-8">
      <div className="glass-panel p-8">
        <h2 className="text-2xl font-bold mb-6">Quản lý Món ăn (CRUD)</h2>
        {/* Nút thêm mới (POST) [cite: 55] */}
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4 hover:bg-green-600">Thêm Món Mới</button>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/30 text-gray-800"><th className="pb-3">Tên món</th><th className="pb-3">Giá</th><th className="pb-3">Hành động</th></tr>
          </thead>
          <tbody>
            {foods.map(food => (
              <tr key={food.id} className="border-b border-white/20">
                <td className="py-3">{food.name}</td><td>{food.price}</td>
                <td>
                  <button className="text-blue-600 mr-4 font-medium">Sửa</button> {/* PUT [cite: 56] */}
                  <button onClick={() => handleDelete(food.id)} className="text-red-600 font-medium">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-panel p-8">
        <h2 className="text-2xl font-bold mb-6">Lịch sử Đơn hàng (GET /orders)</h2>
        {/* Render danh sách orders từ Order Service [cite: 65] */}
        <p className="text-gray-700 italic">Tính năng đang chờ Order Service khởi chạy...</p>
      </div>
    </div>
  );
}