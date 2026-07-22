// LocalStorage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  ADMIN_AUTH: 'adminAuth',
} as const;

// Cart
export const CART = {
  ITEMS_PER_PAGE: 12,
} as const;

// Orders
export const ORDER_STATUS = {
  PENDING: 'pending',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
} as const;
