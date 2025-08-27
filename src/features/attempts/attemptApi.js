/* eslint-disable no-unused-vars */
// src/features/attempts/attemptApi.js
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

export const attemptApi = createApi({
  reducerPath: 'attemptApi',
  baseQuery,
  tagTypes: ['Attempt', 'Attempts'],
  endpoints: (builder) => ({
    
    // Start a new attempt
    startAttempt: builder.mutation({
      query: (paperId) => ({
        url: `/papers/${paperId}/attempt`,
        method: 'GET',
      }),
      invalidatesTags: ['Attempts'],
    }),
    
    // Submit attempt
    submitAttempt: builder.mutation({
      query: ({ paperId, answers, timeSpent }) => ({
        url: `/papers/${paperId}/submit`,
        method: 'POST',
        body: { answers, timeSpent },
      }),
      invalidatesTags: ['Attempts', 'Results'],
    }),
    
    // Get attempt by ID
    getAttemptById: builder.query({
      query: (attemptId) => `/attempts/${attemptId}`,
      providesTags: (result, error, attemptId) => [{ type: 'Attempt', id: attemptId }],
    }),
    
    // Get student's attempts for a paper
    getStudentAttempts: builder.query({
      query: ({ paperId, studentId }) => 
        `/attempts?paperId=${paperId}&studentId=${studentId}`,
      providesTags: ['Attempts'],
    }),
    
    // Get all attempts for a paper (teacher view)
    getPaperAttempts: builder.query({
      query: ({ paperId, page = 1, limit = 10 }) => 
        `/attempts?paperId=${paperId}&page=${page}&limit=${limit}`,
      providesTags: ['Attempts'],
    }),
    
    // Save answer (auto-save during exam)
    saveAnswer: builder.mutation({
      query: ({ attemptId, questionId, answer }) => ({
        url: `/attempts/${attemptId}/answers`,
        method: 'PUT',
        body: { questionId, answer },
      }),
      // Optimistic update - don't invalidate tags for better UX
      onQueryStarted: async ({ attemptId, questionId, answer }, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (error) {
          // Handle error silently or show toast
          console.error('Failed to save answer:', error);
        }
      },
    }),
    
    // Grade attempt (teacher)
    gradeAttempt: builder.mutation({
      query: ({ attemptId, gradingData }) => ({
        url: `/attempts/${attemptId}/grade`,
        method: 'PUT',
        body: gradingData,
      }),
      invalidatesTags: (result, error, { attemptId }) => [
        'Attempts',
        'Results',
        { type: 'Attempt', id: attemptId },
      ],
    }),
    
    // Get attempts pending grading
    getPendingGradingAttempts: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => 
        `/attempts?status=submitted&pendingGrading=true&page=${page}&limit=${limit}`,
      providesTags: ['Attempts'],
    }),
    
    // Auto-grade MCQ questions
    autoGradeAttempt: builder.mutation({
      query: (attemptId) => ({
        url: `/attempts/${attemptId}/auto-grade`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, attemptId) => [
        'Attempts',
        'Results',
        { type: 'Attempt', id: attemptId },
      ],
    }),
    
  }),
});

export const {
  useStartAttemptMutation,
  useSubmitAttemptMutation,
  useGetAttemptByIdQuery,
  useGetStudentAttemptsQuery,
  useGetPaperAttemptsQuery,
  useSaveAnswerMutation,
  useGradeAttemptMutation,
  useGetPendingGradingAttemptsQuery,
  useAutoGradeAttemptMutation,
} = attemptApi;