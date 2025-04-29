// src/pages/LoginPage.jsx
import { useState, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../context/AuthContext';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const { setToken } = useContext(AuthContext);

//   const handleSubmit = async e => {
//     e.preventDefault();
//     try {
//       const { token } = await api.login({ email, password });
//       setToken(token);
//     } catch {
//       setError('Đăng nhập thất bại');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input type="email" value={email} onInput={e => setEmail(e.target.value)} required />
//       <input type="password" value={password} onInput={e => setPassword(e.target.value)} required />
//       <button type="submit">Đăng nhập</button>
//       {error && <p>{error}</p>}
//     </form>
//   );
// }



export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setToken } = useContext(AuthContext);

  // Thay đổi 2 hằng sau thành bất cứ email/pass nào bạn muốn
  const VALID_EMAIL = 'admin@example.com';
  const VALID_PASSWORD = '123456';

  const handleSubmit = e => {
    e.preventDefault();
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      // đặt token giả
      setToken('dummy-token');
      // chuyển về dashboard ("/")
      route('/', true);
    } else {
      setError('Sai email hoặc mật khẩu');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Đăng nhập (Fake)</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onInput={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onInput={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Đăng nhập</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
