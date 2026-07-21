const isDev = process.env.NODE_ENV === 'development';

export const API_BASE = isDev
  ? 'http://localhost:5000/api'
  : 'https://api.k-europe.com/api';
