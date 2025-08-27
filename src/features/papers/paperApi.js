
// src/features/papers/paperApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api/papers',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
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
    // Get all papers
    getPapers: builder.query({
      query: () => '/',
      providesTags: ['Paper'],
      transformResponse: (response) => {
        return {
          papers: response.papers || response || []
        };
      },
    }),

    // Get single paper
    getPaper: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Paper', id }],
    }),

    // Create paper
    createPaper: builder.mutation({
      query: (paperData) => ({
        url: '/',
        method: 'POST',
        body: paperData,
      }),
      invalidatesTags: ['Paper'],
    }),

    // Update paper
    updatePaper: builder.mutation({
      query: ({ id, ...paperData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: paperData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Paper', id }],
    }),

    // Delete paper
    deletePaper: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Paper'],
    }),

    // Get papers created by teacher
    getTeacherPapers: builder.query({
      query: (teacherId) => `/teacher/${teacherId}`,
      providesTags: ['Paper'],
    }),
  }),
});

export const {
  useGetPapersQuery,
  useGetPaperQuery,
  useCreatePaperMutation,
  useUpdatePaperMutation,
  useDeletePaperMutation,
  useGetTeacherPapersQuery,
} = paperApi;
