import { API_BASE } from '../config/api';

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

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// Auth API
// ============================================================================

export const authAPI = {
  register: async (email: string, password: string) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: async (email: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: async (token: string) =>
    fetchAPI('/auth/me', { token, method: 'GET' }),

  forgotPassword: async (email: string) =>
    fetchAPI('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: async (token: string, newPassword: string) =>
    fetchAPI('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ reset_token: token, new_password: newPassword }),
    }),
};

// ============================================================================
// Products API
// ============================================================================

export const productsAPI = {
  getAll: async (category?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    const data = await fetchAPI<any>(`/products?${params}`);
    return data.data?.items || [];
  },

  getById: async (id: string) => {
    const data = await fetchAPI<any>(`/products/${id}`);
    return data.data;
  },

  create: async (token: string, product: any) =>
    fetchAPI('/products', {
      method: 'POST',
      token,
      body: JSON.stringify(product),
    }),

  update: async (token: string, id: string, product: any) =>
    fetchAPI(`/products/${id}`, {
      method: 'PUT',
      token,
      body: JSON.stringify(product),
    }),

  delete: async (token: string, id: string) =>
    fetchAPI(`/products/${id}`, {
      method: 'DELETE',
      token,
    }),

  getCategories: async () => {
    const data = await fetchAPI<any>('/categories');
    return data.data || [];
  },
};

// ============================================================================
// Cart API
// ============================================================================

export const cartAPI = {
  get: async (token: string) => {
    const data = await fetchAPI('/cart', { token, method: 'GET' });
    return data;
  },

  add: async (token: string, productId: string, quantity: number) =>
    fetchAPI('/cart', {
      method: 'POST',
      token,
      body: JSON.stringify({ product_id: productId, quantity }),
    }),

  updateQuantity: async (token: string, cartId: string, quantity: number) =>
    fetchAPI(`/cart/${cartId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ quantity }),
    }),

  remove: async (token: string, cartId: string) =>
    fetchAPI(`/cart/${cartId}`, {
      method: 'DELETE',
      token,
    }),

  clear: async (token: string) =>
    fetchAPI('/cart/clear', {
      method: 'DELETE',
      token,
    }),
};

// ============================================================================
// Orders API
// ============================================================================

export const ordersAPI = {
  create: async (token: string, orderData: any) =>
    fetchAPI<any>('/orders', {
      method: 'POST',
      token,
      body: JSON.stringify(orderData),
    }),

  getUser: async (token: string) => {
    const data = await fetchAPI<any>('/orders', { token, method: 'GET' });
    return data.data || [];
  },

  getAll: async (token: string) => {
    const data = await fetchAPI<any>('/orders/all', { token, method: 'GET' });
    return data.data || [];
  },
};

// ============================================================================
// Admin API (backwards compatibility - uses products API)
// ============================================================================

export const adminAPI = {
  login: async (password: string) =>
    fetchAPI('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
};

// Legacy function for backwards compatibility
export async function getProducts(category?: string) {
  return productsAPI.getAll(category);
}
