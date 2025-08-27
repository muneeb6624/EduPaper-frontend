// src/features/auth/authApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from './authSlice';

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role || null;


// Base query with auth token injection
const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api', // Update with your backend URL
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('content-type', 'application/json');
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
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => {
        return {
          token: response.token,
          user: response.user,
        };
      },
    }),
    
    // Register mutation
    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response) => {
        return {
          token: response.token,
          user: response.user,
        };
      },
    }),
    
    // Refresh token mutation
    refreshToken: builder.mutation({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      transformResponse: (response) => {
        return {
          token: response.token,
          user: response.user,
        };
      },
    }),
    
    // Get current user profile
    getProfile: builder.query({
      query: () => '/users/me',
      providesTags: ['Auth'],
    }),
    
    // Update profile
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/users/me',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
