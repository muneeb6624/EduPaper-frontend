
// src/features/results/resultApi.js
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

export const resultApi = createApi({
  reducerPath: 'resultApi',
  baseQuery,
  tagTypes: ['Result'],
  endpoints: (builder) => ({
    // Get student results
    getStudentResults: builder.query({
      query: (studentId) => `/results/student/${studentId}`,
      providesTags: ['Result'],
      transformResponse: (response) => {
        return response.results || response || [];
      },
    }),

    // Get paper results (class results)
    getPaperResults: builder.query({
      query: (paperId) => `/results/class/${paperId}`,
      providesTags: ['Result'],
    }),

    // Submit result
    submitResult: builder.mutation({
      query: (resultData) => ({
        url: '/results',
        method: 'POST',
        body: resultData,
      }),
      invalidatesTags: ['Result'],
    }),

    // Get single result
    getResult: builder.query({
      query: (id) => `/results/${id}`,
      providesTags: (result, error, id) => [{ type: 'Result', id }],
    }),
  }),
});

export const {
  useGetStudentResultsQuery,
  useGetPaperResultsQuery,
  useSubmitResultMutation,
  useGetResultQuery,
} = resultApi;
