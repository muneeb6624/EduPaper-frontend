// src/features/auth/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from './authSlice';

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role || null;

// Base query with auth token injection
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api/auth',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Enhanced base query with token refresh logic
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    // Token expired, logout user
    api.dispatch(logout());
  }

  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // Login mutation
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => {
        // Backend returns { success, token, user }
        return {
          token: response.token,
          user: response.user || {
            role: response.role,
            name: response.name || 'User',
            email: response.email || '',
          },
        };
      },
    }),
    // Register mutation
    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response) => {
        // Backend returns { success, token, user }
        return {
          token: response.token,
          user: response.user || {
            role: response.role,
            name: response.name || 'User',
            email: response.email || '',
          },
        };
      },
    }),
    // Refresh token mutation
    refreshToken: builder.mutation({
      query: (token) => ({
        url: '/refresh',
        method: 'POST',
        body: { token },
      }),
    }),
    // Get profile query
    getProfile: builder.query({
      query: () => ({
        url: '/profile',
        method: 'GET',
      }),
      transformResponse: (response) => {
        // Backend returns { user }
        return response.user;
      },
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
} = authApi;