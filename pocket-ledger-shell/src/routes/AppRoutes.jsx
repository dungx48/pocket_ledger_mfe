// src/routes/AppRoutes.jsx
import { Router, Route } from 'preact-router';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import { useContext } from 'preact/hooks';
import { AuthContext } from '../context/AuthContext';

export default function AppRoutes() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <Router>
      {/* Route mặc định, sẽ render LoginPage nếu chưa login */}
      <Route path="/" component={isLoggedIn ? DashboardPage : LoginPage} />
      {/* Bạn vẫn giữ /login nếu muốn URL rõ ràng */}
      <Route path="/login" component={LoginPage} />
    </Router>
  );
}
