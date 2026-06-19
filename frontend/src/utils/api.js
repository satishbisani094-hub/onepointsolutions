import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV 
    ? 'http://localhost:5000/api' 
    : '/_/backend/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
