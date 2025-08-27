
import { createSlice } from '@reduxjs/toolkit';

// Get initial state from localStorage
const getInitialState = () => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      return {
        user: JSON.parse(user),
        token,
        isAuthenticated: true,
        loading: false,
      };
    }
  } catch (error) {
    console.error('Error parsing auth state from localStorage:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (state, action) => {
      const { token, user, role } = action.payload;
      
      // Create user object if not provided
      const userData = user || {
        role: role,
        name: 'User', // Default name, should be updated from profile
        email: '', // Should be fetched from profile
      };
      
      state.user = userData;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    },
    
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, updateUser, logout, setLoading } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;
