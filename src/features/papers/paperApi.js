
// src/features/papers/paperApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api/',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const paperApi = createApi({
  reducerPath: 'paperApi',
  baseQuery,
  tagTypes: ['Paper'],
  endpoints: (builder) => ({
    // Get all papers for a user
    getPapers: builder.query({
      query: (userId) => `papers/user/${userId}`,
      providesTags: ['Paper'],
      transformResponse: (response) => {
        return {
          papers: response.papers || response || []
        };
      },
    }),

    // Get single paper
    getPaper: builder.query({
      query: (id) => `papers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Paper', id }],
    }),

    // Get single paper by ID (alias for getPaper)
    getPaperById: builder.query({
      query: (id) => `papers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Paper', id }],
    }),

    // Create paper
    createPaper: builder.mutation({
      query: (paperData) => ({
        url: 'papers',
        method: 'POST',
        body: paperData,
      }),
      invalidatesTags: ['Paper'],
    }),
    
    // Update paper
    updatePaper: builder.mutation({
      query: ({ id, ...paperData }) => ({
        url: `papers/${id}`,
        method: 'PUT',
        body: paperData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Paper', id }],
    }),

    // Delete paper
    deletePaper: builder.mutation({
      query: (id) => ({
        url: `papers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Paper'],
    }),

    // Get papers created by teacher
    getTeacherPapers: builder.query({
      query: (teacherId) => `papers/teacher/${teacherId}`,
      providesTags: ['Paper'],
      transformResponse: (response) => {
        return {
          papers: response.papers || response || []
        };
      },
    }),

    // Assign paper to students
    assignPaper: builder.mutation({
      query: ({ paperId, studentIds }) => ({
        url: `papers/${paperId}/assign`,
        method: 'POST',
        body: { studentIds },
      }),
      invalidatesTags: ['Paper'],
    }),

    // Get assigned papers for student
    getAssignedPapers: builder.query({
      query: (studentId) => `papers/assigned/${studentId}`,
      providesTags: ['Paper'],
      transformResponse: (response) => {
        return {
          papers: response.papers || response || []
        };
      },
    }),
  }),
});

export const {
  useGetPapersQuery,
  useGetPaperQuery,
  useGetPaperByIdQuery,
  useCreatePaperMutation,
  useUpdatePaperMutation,
  useDeletePaperMutation,
  useGetTeacherPapersQuery,
  useAssignPaperMutation,
  useGetAssignedPapersQuery,
} = paperApi;
