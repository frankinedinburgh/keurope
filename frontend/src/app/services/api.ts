import { API_BASE } from '../config/api';
import { handleAPIError, logError } from '../lib/errors';

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  image_url: string;
  sizes?: string[];
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
}

export interface Order {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  total_price: number;
  status: 'pending' | 'shipped' | 'delivered';
  created_at: string;
}

interface ApiResponse<T> {
  status: string;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface CreateOrderRequest {
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  items: CartItem[];
  total_price: number;
}

interface ProductsListResponse {
  items: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateOrderResponse {
  order_id: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      handleAPIError(response.status, text);
    }

    return response.json();
  } catch (error) {
    logError(error, `API Call: ${options.method || 'GET'} ${endpoint}`);
    throw error;
  }
}

// ============================================================================
// Auth API
// ============================================================================

export const authAPI = {
  register: async (email: string, password: string): Promise<AuthResponse> =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: async (email: string, password: string): Promise<AuthResponse> =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: async (token: string): Promise<User> =>
    fetchAPI('/auth/me', { token, method: 'GET' }),

  forgotPassword: async (email: string): Promise<{ status: string; message: string }> =>
    fetchAPI('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: async (token: string, newPassword: string): Promise<{ status: string; message: string }> =>
    fetchAPI('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ reset_token: token, new_password: newPassword }),
    }),
};

// ============================================================================
// Products API
// ============================================================================

export const productsAPI = {
  getAll: async (category?: string): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    const data = await fetchAPI<ApiResponse<ProductsListResponse>>(`/products?${params}`);
    return data.data?.items || [];
  },

  getById: async (id: string): Promise<Product> => {
    const data = await fetchAPI<ApiResponse<Product>>(`/products/${id}`);
    return data.data || ({} as Product);
  },

  create: async (token: string, product: Omit<Product, 'id'>): Promise<Product> =>
    fetchAPI('/products', {
      method: 'POST',
      token,
      body: JSON.stringify(product),
    }),

  update: async (token: string, id: string, product: Partial<Product>): Promise<Product> =>
    fetchAPI(`/products/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(product),
    }),

  delete: async (token: string, id: string): Promise<{ status: string }> =>
    fetchAPI(`/products/${id}`, {
      method: 'DELETE',
      token,
    }),

  getCategories: async (): Promise<string[]> => {
    const data = await fetchAPI<ApiResponse<string[]>>('/categories');
    return data.data || [];
  },
};

// ============================================================================
// Cart API
// ============================================================================

export const cartAPI = {
  get: async (token: string): Promise<CartResponse> =>
    fetchAPI('/cart', { token, method: 'GET' }),

  add: async (token: string, productId: string, quantity: number): Promise<CartItem> =>
    fetchAPI('/cart', {
      method: 'POST',
      token,
      body: JSON.stringify({ product_id: productId, quantity }),
    }),

  updateQuantity: async (token: string, cartId: string, quantity: number): Promise<CartItem> =>
    fetchAPI(`/cart/${cartId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ quantity }),
    }),

  remove: async (token: string, cartId: string): Promise<{ status: string }> =>
    fetchAPI(`/cart/${cartId}`, {
      method: 'DELETE',
      token,
    }),

  clear: async (token: string): Promise<{ status: string }> =>
    fetchAPI('/cart/clear', {
      method: 'DELETE',
      token,
    }),
};

// ============================================================================
// Orders API
// ============================================================================

export const ordersAPI = {
  create: async (token: string, orderData: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> =>
    fetchAPI('/orders', {
      method: 'POST',
      token,
      body: JSON.stringify(orderData),
    }),

  getUser: async (token: string): Promise<Order[]> => {
    const data = await fetchAPI<ApiResponse<Order[]>>('/orders', { token, method: 'GET' });
    return data.data || [];
  },

  getAll: async (token: string): Promise<Order[]> => {
    const data = await fetchAPI<ApiResponse<Order[]>>('/orders/all', { token, method: 'GET' });
    return data.data || [];
  },
};

// ============================================================================
// Admin API (backwards compatibility - uses products API)
// ============================================================================

export const adminAPI = {
  login: async (password: string): Promise<{ token: string }> =>
    fetchAPI('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
};

// Legacy function for backwards compatibility
export async function getProducts(category?: string): Promise<Product[]> {
  return productsAPI.getAll(category);
}
