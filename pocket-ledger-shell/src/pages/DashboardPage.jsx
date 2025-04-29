// src/pages/DashboardPage.jsx
import { useContext, useEffect, useState } from 'preact/hooks';
import { AuthContext } from '../context/AuthContext';

export default function DashboardPage() {
  const { isLoggedIn } = useContext(AuthContext);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // ví dụ fetch data khi vào dashboard
    fetch('/api/hello', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    })
      .then(res => res.json())
      .then(data => setMessage(data.msg || 'Chào mừng!'))
      .catch(() => setMessage('Không lấy được dữ liệu'));
  }, []);

  if (!isLoggedIn) return <p>Bạn phải đăng nhập để xem trang này.</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>{message}</p>
      {/* TODO: Thêm các component như ExpenseForm, ExpenseList tại đây */}
    </div>
  );
}
