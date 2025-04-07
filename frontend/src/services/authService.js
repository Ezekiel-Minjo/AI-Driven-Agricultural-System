import api from "./api";

// Get token from localStorage
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// Initialize axios with token
export const initializeAuth = () => {
  const token = getToken();
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

// Register a new user
export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);

    // Save token and user to localStorage
    const { token, user } = response.data;
    saveToken(token);
    saveUser(user);

    // Set Authorization header
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Login a user
export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);

    // Save token and user to localStorage
    const { token, user } = response.data;
    saveToken(token);
    saveUser(user);

    // Set Authorization header
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Logout a user
export const logout = () => {
  // Remove token and user from localStorage
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  // Remove Authorization header
  delete api.defaults.headers.common["Authorization"];
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");

    // Update user in localStorage
    saveUser(response.data);

    return response.data;
  } catch (error) {
    console.error("Get current user error:", error);
    // If token is invalid, logout
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      logout();
    }
    throw error;
  }
};

// Get user from localStorage
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
    return null;
  }
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Save token to localStorage
const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Save user to localStorage
const saveUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
