// src/app/services/api.ts
import { API_BASE } from '../config/api';

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
