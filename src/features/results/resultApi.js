// src/features/results/resultApi.js
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

export const resultApi = createApi({
  reducerPath: 'resultApi',
  baseQuery,
  tagTypes: ['Result', 'Results'],
  endpoints: (builder) => ({
    
    // Get result by ID
    getResultById: builder.query({
      query: (resultId) => `/results/${resultId}`,
      providesTags: (result, error, resultId) => [{ type: 'Result', id: resultId }],
    }),
    
    // Get student's results
    getStudentResults: builder.query({
      query: ({ studentId, page = 1, limit = 10 }) => 
        `/results/student/${studentId}?page=${page}&limit=${limit}`,
      providesTags: ['Results'],
    }),
    
    // Get class results for a paper (teacher view)
    getClassResults: builder.query({
      query: ({ paperId, page = 1, limit = 10 }) => 
        `/results/class/${paperId}?page=${page}&limit=${limit}`,
      providesTags: ['Results'],
    }),
    
    // Get my results (current logged-in student)
    getMyResults: builder.query({
      query: ({ page = 1, limit = 10, paperId } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(paperId && { paperId }),
        });
        return `/results/me?${params}`;
      },
      providesTags: ['Results'],
    }),
    
    // Publish result (make it visible to student)
    publishResult: builder.mutation({
      query: ({ resultId, feedback }) => ({
        url: `/results/${resultId}/publish`,
        method: 'PUT',
        body: { feedback },
      }),
      invalidatesTags: (result, error, { resultId }) => [
        'Results',
        { type: 'Result', id: resultId },
      ],
    }),
    
    // Update result feedback
    updateResultFeedback: builder.mutation({
      query: ({ resultId, feedback, grade }) => ({
        url: `/results/${resultId}`,
        method: 'PUT',
        body: { feedback, grade },
      }),
      invalidatesTags: (result, error, { resultId }) => [
        'Results',
        { type: 'Result', id: resultId },
      ],
    }),
    
    // Get analytics for a paper
    getPaperAnalytics: builder.query({
      query: (paperId) => `/results/analytics/${paperId}`,
      providesTags: (result, error, paperId) => [
        { type: 'Results', id: `analytics-${paperId}` },
      ],
    }),
    
    // Get student performance analytics
    getStudentAnalytics: builder.query({
      query: (studentId) => `/results/student/${studentId}/analytics`,
      providesTags: (result, error, studentId) => [
        { type: 'Results', id: `student-analytics-${studentId}` },
      ],
    }),
    
    // Export results to CSV
    exportResults: builder.mutation({
      query: ({ paperId, format = 'csv' }) => ({
        url: `/results/export/${paperId}`,
        method: 'POST',
        body: { format },
        responseHandler: (response) => response.blob(),
      }),
    }),
    
    // Get leaderboard
    getLeaderboard: builder.query({
      query: ({ paperId, limit = 10 }) => 
        `/results/leaderboard/${paperId}?limit=${limit}`,
      providesTags: (result, error, paperId) => [
        { type: 'Results', id: `leaderboard-${paperId}` },
      ],
    }),
    
  }),
});

export const {
  useGetResultByIdQuery,
  useGetStudentResultsQuery,
  useGetClassResultsQuery,
  useGetMyResultsQuery,
  usePublishResultMutation,
  useUpdateResultFeedbackMutation,
  useGetPaperAnalyticsQuery,
  useGetStudentAnalyticsQuery,
  useExportResultsMutation,
  useGetLeaderboardQuery,
} = resultApi;