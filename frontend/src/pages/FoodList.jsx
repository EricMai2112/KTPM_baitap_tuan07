import { useEffect, useState } from 'react';
import { foodService } from '../services/api';
import { useCart } from '../context/CartContext';
import { Plus, Tag, Image as ImageIcon } from 'lucide-react';

export default function FoodList() {
  const [foods, setFoods] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    foodService.getFoods()
      .then(res => setFoods(res.data))
      .catch(() => {
        // Mock data được cập nhật khớp với Schema của Backend để test UI
        setFoods([
          { 
            _id: '1', 
            name: "Burger Bò Phô Mai", 
            price: 55000, 
            description: "Bò nhập khẩu 100%, phô mai dẻo nguyên chất, ăn kèm khoai tây chiên",
            category: "Fast Food",
            imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"
          },
          { 
            _id: '2', 
            name: "Pizza Hải Sản Nhiệt Đới", 
            price: 120000, 
            description: "Tôm sú, mực ống, thanh cua, dứa, sốt cà chua và phô mai mozzarella",
            category: "Pizza",
            imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80"
          },
          { 
            _id: '3', 
            name: "Trà Sữa Trân Châu Hokka", 
            price: 35000, 
            description: "Hồng trà đậm vị, sữa tươi thanh trùng, trân châu đen dai ngon",
            category: "Đồ Uống",
            imageUrl: "https://images.unsplash.com/photo-1534056080345-61db5e216016?auto=format&fit=crop&w=600&q=80"
          },
          { 
            _id: '4', 
            name: "Salad Cá Hồi", 
            price: 85000, 
            description: "Cá hồi Na Uy áp chảo, xà lách romaine, cà chua bi, sốt mè rang",
            category: "Healthy",
            imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
          },
        ]);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6">
      <h1 className="text-4xl font-black text-white drop-shadow-lg mb-10 text-center animate-fade-in-up">
        Hôm Nay Ăn Gì?
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {foods.map((food, index) => {
          // Xử lý lấy ID (Hỗ trợ cả _id của MongoDB và id thông thường)
          const foodId = food._id || food.id;

          return (
            <div 
              key={foodId} 
              className="glass-panel p-5 flex flex-col hover:-translate-y-2 transition-all duration-300 relative group" 
              style={{ animationDelay: `${index * 100}ms` }}
            >
              
              {/* Category Badge */}
              {food.category && (
                <div className="absolute top-7 right-7 bg-indigo-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md z-10 flex items-center gap-1.5 shadow-lg">
                  <Tag size={12} /> {food.category}
                </div>
              )}

              {/* Image Container */}
              <div className="h-48 w-full bg-white/30 rounded-xl mb-5 flex items-center justify-center overflow-hidden shadow-inner relative">
                 {food.imageUrl ? (
                   <img 
                     src={food.imageUrl} 
                     alt={food.name} 
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                     onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=No+Image' }} // Fix lỗi link ảnh hỏng
                   />
                 ) : (
                   <div className="text-gray-500 flex flex-col items-center">
                     <ImageIcon size={48} className="opacity-50 mb-2"/>
                     <span className="text-sm font-medium">Chưa có ảnh</span>
                   </div>
                 )}
              </div>

              {/* Info Container */}
              <div className="flex-1 flex flex-col">
                <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1" title={food.name}>
                  {food.name}
                </h2>

                <h3 className="font-bold text-gray-900 mb-2 line-clamp-1" title={food.name}>
                  Số lượng: {food?.stock}
                </h3>
                
                <p className="text-sm text-gray-700 mb-4 line-clamp-2 leading-relaxed" title={food.description}>
                  {food.description || "Đang cập nhật mô tả..."}
                </p>
                
                {/* Footer (Price & Add to Cart) */}
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/30">
                  <span className="text-xl font-black text-indigo-900 drop-shadow-sm">
                    {food.price.toLocaleString()}đ
                  </span>
                  
                  <button 
                    // Chú ý: Truyền id thay vì _id vào giỏ hàng để đồng bộ logic CartContext
                    onClick={() => addToCart({ ...food, id: foodId })} 
                    className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center group-hover:bg-pink-500"
                    title="Thêm vào giỏ"
                  >
                    <Plus size={22} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}