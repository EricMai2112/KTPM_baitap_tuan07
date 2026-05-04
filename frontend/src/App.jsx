import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import FoodList from './pages/FoodList';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import AdminFood from './pages/AdminFood';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen">
            <Navbar />
            <main className="pb-12">
              <Routes>
                <Route path="/" element={<FoodList />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/admin" element={<AdminFood />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;