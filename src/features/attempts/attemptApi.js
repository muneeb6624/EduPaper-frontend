// src/features/attempts/attemptApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
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

    // ✅ Start attempt (student)
    startAttempt: builder.mutation({
      query: (paperId) => ({
        url: `/papers/${paperId}/attempt`,
        method: 'GET',
      }),
      invalidatesTags: ['Attempt'],
    }),

    // ✅ Submit attempt (student)
    submitAttempt: builder.mutation({
      query: ({ paperId, answers }) => ({
        url: `/papers/${paperId}/submit`,
        method: 'POST',
        body: { answers },
      }),
      invalidatesTags: ['Attempt'],
    }),

    // ✅ Grade attempt (teacher)
    gradeAttempt: builder.mutation({
      query: ({ attemptId, gradedAnswers }) => ({
        url: `/attempts/${attemptId}/grade`,
        method: 'PUT',
        body: { gradedAnswers },
      }),
      invalidatesTags: ['Attempt'],
    }),

    // ✅ Get all attempts for a specific paper (teacher)
    getPaperAttempts: builder.query({
      query: (paperId) => `/papers/${paperId}/attempts`,
      providesTags: ['Attempt'],
    }),

    // ✅ Get all attempts by a student
    getStudentAttempts: builder.query({
      query: (studentId) => `/students/${studentId}/attempts`,
      providesTags: ['Attempt'],
    }),

    // ✅ Get specific attempt details
    getAttempt: builder.query({
      query: (attemptId) => `/attempts/${attemptId}`,
      providesTags: ['Attempt'],
    }),
  }),
});

export const {
  useStartAttemptMutation,        // ✅ GET /papers/:paperId/attempt
  useSubmitAttemptMutation,       // ✅ POST /papers/:paperId/submit
  useGradeAttemptMutation,        // ✅ PUT /attempts/:id/grade
  useGetPaperAttemptsQuery,       // ✅ GET /papers/:paperId/attempts
  useGetStudentAttemptsQuery,     // ✅ GET /students/:studentId/attempts
  useGetAttemptQuery,             // ✅ GET /attempts/:id
} = attemptApi;