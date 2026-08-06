import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure base API URL (Vite proxy config can also handle routing, but absolute baseURL makes dev robust)
axios.defaults.baseURL = 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ns_token') || null);
  const [loading, setLoading] = useState(true);

  // Dynamically set authorization header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('ns_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('ns_token');
    }
  }, [token]);

  // Load user profile on mount if token is present
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/users/profile');
          setUser(response.data);
        } catch (error) {
          console.error("Token validation failed, logging out:", error);
          handleLogout();
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [token]);

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { access_token } = response.data;
      setToken(access_token);
      return true;
    } catch (error) {
      let message = "Authentication failed. Please verify credentials.";
      if (error.response?.data?.detail) {
        message = Array.isArray(error.response.data.detail) 
          ? error.response.data.detail[0].msg 
          : error.response.data.detail;
      }
      throw new Error(message);
    }
  };

  const handleRegister = async (fullName, username, email, password, roleName) => {
    try {
      await axios.post('/api/auth/register', {
        full_name: fullName,
        username: username,
        email: email,
        password: password,
        role_name: roleName
      });
      return true;
    } catch (error) {
      let message = "Registration failed. Please check inputs.";
      if (error.response?.data?.detail) {
        message = Array.isArray(error.response.data.detail) 
          ? error.response.data.detail[0].msg 
          : error.response.data.detail;
      }
      throw new Error(message);
    }
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.warn("Server-side logout log failed:", error);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/users/profile', profileData);
      setUser(response.data);
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || "Profile update failed.";
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      handleLogout,
      updateProfile: handleUpdateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be called inside an AuthProvider");
  }
  return context;
};
export default AuthContext;
