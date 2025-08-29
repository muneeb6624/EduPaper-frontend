// src/features/User/userApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api/',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Get all students (for teachers)
    getStudents: builder.query({
      query: () => 'users',
      providesTags: ['User'],
      transformResponse: (response) => {
        return response.users || response || [];
      },
    }),

    // Get all users
    getUsers: builder.query({
      query: () => 'users',
      providesTags: ['User'],
    }),

    // Get user profile
    getProfile: builder.query({
      query: (userId) => `users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    // Update profile
    updateProfile: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetUsersQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = userApi;