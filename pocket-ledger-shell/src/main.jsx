// src/main.jsx
import { render } from 'preact';
import { AuthProvider } from './context/AuthContext';
import App from './app';

render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById('app')  // phải là 'app' như trong index.html
);
