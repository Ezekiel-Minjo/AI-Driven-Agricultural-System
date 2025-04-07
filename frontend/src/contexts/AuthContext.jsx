import { createContext, useState, useEffect, useContext } from 'react';
import { initializeAuth, getUser, isAuthenticated, logout, getCurrentUser } from '../services/authService';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Initialize authentication
    initializeAuth();

    // Check if user is authenticated
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          // Get user from localStorage
          const user = getUser();
          setCurrentUser(user);

          // Verify token and get updated user data
          const updatedUser = await getCurrentUser();
          setCurrentUser(updatedUser);
        } catch (error) {
          console.error('Auth check error:', error);
          // If token is invalid, logout
          logout();
          setCurrentUser(null);
        }
      }

      setLoading(false);
      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  // Define auth values
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    authChecked,
    setCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}