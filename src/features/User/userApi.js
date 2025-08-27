// src/features/users/userApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('content-type', 'application/json');
    return headers;
  },
});

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  tagTypes: ['User', 'Users'],
  endpoints: (builder) => ({
    
    // Get all users (admin only)
    getAllUsers: builder.query({
      query: ({ page = 1, limit = 10, role = '', search = '' } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(role && { role }),
          ...(search && { search }),
        });
        return `/users?${params}`;
      },
      providesTags: ['Users'],
    }),
    
    // Get user by ID
    getUserById: builder.query({
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
    
    // Update user (admin only)
    updateUser: builder.mutation({
      query: ({ userId, ...userData }) => ({
        url: `/users/${userId}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { userId }) => [
        'Users',
        { type: 'User', id: userId },
      ],
    }),
    
    // Delete user (admin only)
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    
    // Get students (for teacher assignment)
    getStudents: builder.query({
      query: ({ page = 1, limit = 50, search = '' } = {}) => {
        const params = new URLSearchParams({
          role: 'student',
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
        });
        return `/users?${params}`;
      },
      providesTags: ['Users'],
    }),
    
    // Get teachers (for admin management)
    getTeachers: builder.query({
      query: ({ page = 1, limit = 50, search = '' } = {}) => {
        const params = new URLSearchParams({
          role: 'teacher',
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
        });
        return `/users?${params}`;
      },
      providesTags: ['Users'],
    }),
    
    // Create user (admin only)
    createUser: builder.mutation({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users'],
    }),
    
    // Toggle user active status
    toggleUserStatus: builder.mutation({
      query: ({ userId, isActive }) => ({
        url: `/users/${userId}`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: (result, error, { userId }) => [
        'Users',
        { type: 'User', id: userId },
      ],
    }),
    
    // Get user statistics
    getUserStats: builder.query({
      query: () => '/users/stats',
      providesTags: ['Users'],
    }),
    
    // Bulk operations
    bulkUpdateUsers: builder.mutation({
      query: ({ userIds, updateData }) => ({
        url: '/users/bulk-update',
        method: 'PUT',
        body: { userIds, updateData },
      }),
      invalidatesTags: ['Users'],
    }),
    
    bulkDeleteUsers: builder.mutation({
      query: (userIds) => ({
        url: '/users/bulk-delete',
        method: 'DELETE',
        body: { userIds },
      }),
      invalidatesTags: ['Users'],
    }),
    
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetStudentsQuery,
  useGetTeachersQuery,
  useCreateUserMutation,
  useToggleUserStatusMutation,
  useGetUserStatsQuery,
  useBulkUpdateUsersMutation,
  useBulkDeleteUsersMutation,
} = userApi;