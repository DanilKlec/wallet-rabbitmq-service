import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(new Error(err.response?.data?.message || err.message))
);

export async function register(email, password) {
  const { data } = await client.post('/auth/register', { email, password });
  return data.data;
}

export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return data.data;
}

export async function getProfile() {
  const { data } = await client.get('/auth/profile');
  return data.data;
}

export async function getWallet() {
  const { data } = await client.get('/wallet');
  return data.data;
}

export async function getTransactions(params) {
  const { data } = await client.get('/transactions', { params });
  return data.data;
}

export async function deposit(amount, description) {
  const { data } = await client.post('/transactions/deposit', { amount, description });
  return data.data;
}

export async function withdraw(amount, description) {
  const { data } = await client.post('/transactions/withdraw', { amount, description });
  return data.data;
}

export async function transfer(toUserId, amount, description) {
  const { data } = await client.post('/transactions/transfer', {
    toUserId,
    amount,
    description,
  });
  return data.data;
}

export default client;
