
// src/features/attempts/attemptApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api',
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
      query: (paperId) => ({
        url: `/papers/${paperId}/attempt`,
        method: 'GET',
      }),
      invalidatesTags: ['Attempt'],
    }),

    // Submit attempt
    submitAttempt: builder.mutation({
      query: ({ paperId, answers }) => ({
        url: `/papers/${paperId}/submit`,
        method: 'POST',
        body: { answers },
      }),
      invalidatesTags: ['Attempt'],
    }),

    // Get student attempts
    getStudentAttempts: builder.query({
      query: (studentId) => `/results/student/${studentId}`,
      providesTags: ['Attempt'],
      transformResponse: (response) => {
        return response || [];
      },
    }),

    // Get paper attempts (for teachers)
    getPaperAttempts: builder.query({
      query: (paperId) => `/results/class/${paperId}`,
      providesTags: ['Attempt'],
      transformResponse: (response) => {
        return response.attempts || response || [];
      },
    }),

    // Get single attempt
    getAttempt: builder.query({
      query: (id) => `/results/${id}`,
      providesTags: (result, error, id) => [{ type: 'Attempt', id }],
    }),

    // Grade attempt (for teachers)
    gradeAttempt: builder.mutation({
      query: ({ attemptId, gradedAnswers }) => ({
        url: `/attempts/${attemptId}/grade`,
        method: 'PUT',
        body: { gradedAnswers },
      }),
      invalidatesTags: ['Attempt'],
    }),
  }),
});

export const {
  useStartAttemptMutation,
  useSubmitAttemptMutation,
  useGetStudentAttemptsQuery,
  useGetPaperAttemptsQuery,
  useGetAttemptQuery,
  useGradeAttemptMutation,
} = attemptApi;
