import axios from 'axios';

const FOOD_IP = 'http://172.16.67.106';
const USER_IP = 'http://172.16.52.128';
const ORDER_IP = 'http://172.16.67.38';

// ==========================================
// THÊM MỚI: IP CỦA INVENTORY SERVICE (PU4)
// ==========================================
const INVENTORY_IP = 'http://172.16.69.166:8084'; 

// 1. User Service (Port 8081)
export const userApi = axios.create({ baseURL: `${USER_IP}:8081` });
export const userService = {
  login: (data) => userApi.post('/api/users/login', data), 
  register: (data) => userApi.post('/api/users/register', data),
  getUsers: () => userApi.get('/api/users'),
};

// 2. Food Service / Product PU1
export const foodApi = axios.create({ baseURL: `${FOOD_IP}:8081` });
export const foodService = {
  getFoods: () => foodApi.get('/products'),
  createFood: (data) => foodApi.post('/products', data),
  updateFood: (id, data) => foodApi.put(`/products/${id}`, data),
  deleteFood: (id) => foodApi.delete(`/products/${id}`),
};

// 3. Order Service 
export const orderApi = axios.create({ baseURL: `${ORDER_IP}:8083` });
export const orderService = {
  createOrder: (data) => orderApi.post('/checkout', data),
  getOrders: () => orderApi.get('/orders'),
};

const PAYMENT_REAL_IP = 'http://172.16.67.106'; 
export const paymentApi = axios.create({ baseURL: `${PAYMENT_REAL_IP}:8084` });
export const paymentService = {
  processPayment: (data) => paymentApi.post('/payments', data), 
};

// 5. Cart Service (PU2)
export const cartApi = axios.create({ baseURL: `http://localhost:8082` }); 
export const cartService = {
  addToCart: (data) => cartApi.post('/cart/add', data),
  getCart: (userId) => cartApi.get(`/cart/${userId}`)
};

export const inventoryApi = axios.create({ baseURL: INVENTORY_IP });
export const inventoryService = {
  reduceStock: (data) => inventoryApi.post('/stock/decrease', data),
};

// Thêm token vào header
const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

userApi.interceptors.request.use(attachToken);
foodApi.interceptors.request.use(attachToken);
orderApi.interceptors.request.use(attachToken);
cartApi.interceptors.request.use(attachToken);
inventoryApi.interceptors.request.use(attachToken);