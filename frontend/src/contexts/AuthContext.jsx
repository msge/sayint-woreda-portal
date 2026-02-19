import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API URL:', API_URL); // Debug log

// Configure axios
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  console.log('AuthProvider initialized. Token exists:', !!token); // Debug log

  // Set up axios interceptor
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        console.log('Axios request:', config.method, config.url); // Debug log
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [token]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      console.log('Loading user...'); // Debug log
      if (token) {
        try {
          console.log('Fetching user data...'); // Debug log
          const response = await axios.get('/auth/me');
          console.log('User data received:', response.data); // Debug log
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          console.error('Error details:', error.response?.data || error.message);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (employeeId, password) => {
    console.log('Login attempt with:', { employeeId }); // Debug log
    try {
      const response = await axios.post('/auth/login', { 
        employeeId, 
        password 
      });
      console.log('Login response:', response.data); // Debug log
      
      const { user, token } = response.data.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      return { success: true };
    } catch (error) {
      console.error('Login error details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    console.log('Logging out...'); // Debug log
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    axios.post('/auth/logout').catch(console.error);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};