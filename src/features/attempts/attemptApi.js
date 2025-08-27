
// src/features/attempts/attemptApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api/attempts',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const attemptApi = createApi({
  reducerPath: 'attemptApi',
  baseQuery,
  tagTypes: ['Attempt'],
  endpoints: (builder) => ({
    // Start attempt
    startAttempt: builder.mutation({
      query: (attemptData) => ({
        url: '/start',
        method: 'POST',
        body: attemptData,
      }),
      invalidatesTags: ['Attempt'],
    }),

    // Submit attempt
    submitAttempt: builder.mutation({
      query: ({ attemptId, answers }) => ({
        url: `/${attemptId}/submit`,
        method: 'POST',
        body: { answers },
      }),
      invalidatesTags: ['Attempt'],
    }),

    // Get student attempts
    getStudentAttempts: builder.query({
      query: (studentId) => `/student/${studentId}`,
      providesTags: ['Attempt'],
    }),

    // Get paper attempts
    getPaperAttempts: builder.query({
      query: (paperId) => `/paper/${paperId}`,
      providesTags: ['Attempt'],
    }),

    // Get single attempt
    getAttempt: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Attempt', id }],
    }),
  }),
});

export const {
  useStartAttemptMutation,
  useSubmitAttemptMutation,
  useGetStudentAttemptsQuery,
  useGetPaperAttemptsQuery,
  useGetAttemptQuery,
} = attemptApi;
