// src/context/AuthContext.jsx
import { createContext } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const isLoggedIn = Boolean(token);

  useEffect(() => {
    if (token) localStorage.setItem('authToken', token);
    else localStorage.removeItem('authToken');
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}
