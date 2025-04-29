const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(API_URL + path, options);
  if (!res.ok) throw new Error('API error');
  return res.json();
}

export default {
  login: ({ email, password }) =>
    request('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }),
  // sau này thêm createExpense, getExpenses…
};
