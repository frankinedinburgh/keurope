// src/app/services/api.ts
const isDev = typeof window !== 'undefined' &&
              (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE = isDev ? 'http://localhost:5000/api' : 'https://api.k-europe.com/api';

export async function getProducts(category?: string) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);

  const response = await fetch(
    `${API_BASE}/products?${params}`
  );
  const data = await response.json();

  if (data.status === 'success') {
    return data.data.items;
  }
  return [];
}
