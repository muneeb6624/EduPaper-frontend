// src/features/papers/paperApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
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
    // ✅ Get all papers
    getPapers: builder.query({
      query: () => '/papers',
      providesTags: ['Paper'],
      transformResponse: (response) => ({
        papers: response.papers || response || [],
      }),
    }),

    // ✅ Get single paper
    getPaper: builder.query({
      query: (id) => `/papers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Paper', id }],
    }),

    // ✅ Alias for getPaper
    getPaperById: builder.query({
      query: (id) => `/papers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Paper', id }],
    }),

    // ✅ Create paper
    createPaper: builder.mutation({
      query: (paperData) => ({
        url: '/papers',
        method: 'POST',
        body: paperData,
      }),
      invalidatesTags: ['Paper'],
    }),

    // ✅ Update paper
    updatePaper: builder.mutation({
      query: ({ id, ...paperData }) => ({
        url: `/papers/${id}`,
        method: 'PUT',
        body: paperData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Paper', id }],
    }),

    // ✅ Delete paper
    deletePaper: builder.mutation({
      query: (id) => ({
        url: `/papers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Paper'],
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
} = paperApi;
