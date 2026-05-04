import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, UserCircle, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 glass-panel !rounded-none !border-t-0 !border-x-0 mb-8 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-white drop-shadow-md">
          MiniFood<span className="text-yellow-300">App</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/cart" className="relative text-white hover:text-yellow-200 transition">
            <ShoppingCart size={28} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-4 text-white">
              <span className="font-medium flex items-center gap-2"><UserCircle /> {user.username}</span>
              {user.role === 'ADMIN' && <Link to="/admin" className="text-sm underline">Quản lý</Link>}
              <button onClick={logout} className="hover:text-red-300"><LogOut size={20} /></button>
            </div>
          ) : (
            <Link to="/auth" className="bg-white/30 hover:bg-white/50 text-white px-5 py-2 rounded-full font-medium transition backdrop-blur-sm">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}