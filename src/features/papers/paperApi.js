// src/features/papers/paperApi.js
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

export const paperApi = createApi({
  reducerPath: 'paperApi',
  baseQuery,
  tagTypes: ['Paper', 'Papers'],
  endpoints: (builder) => ({
    
    // Get all papers (with filtering)
    getPapers: builder.query({
      query: ({ page = 1, limit = 10, subject = '', difficulty = '', search = '' } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(subject && { subject }),
          ...(difficulty && { difficulty }),
          ...(search && { search }),
        });
        return `/papers?${params}`;
      },
      providesTags: ['Papers'],
      transformResponse: (response) => ({
        papers: response.data || response.papers || response,
        pagination: response.pagination || {},
      }),
    }),
    
    // Get single paper by ID
    getPaperById: builder.query({
      query: (id) => `/papers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Paper', id }],
    }),
    
    // Create new paper
    createPaper: builder.mutation({
      query: (paperData) => ({
        url: '/papers',
        method: 'POST',
        body: paperData,
      }),
      invalidatesTags: ['Papers'],
    }),
    
    // Update paper
    updatePaper: builder.mutation({
      query: ({ id, ...paperData }) => ({
        url: `/papers/${id}`,
        method: 'PUT',
        body: paperData,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Papers',
        { type: 'Paper', id },
      ],
    }),
    
    // Delete paper
    deletePaper: builder.mutation({
      query: (id) => ({
        url: `/papers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Papers'],
    }),
    
    // Get papers created by teacher
    getMyPapers: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => 
        `/papers?createdBy=me&page=${page}&limit=${limit}`,
      providesTags: ['Papers'],
    }),
    
    // Get papers assigned to student
    getAssignedPapers: builder.query({
      query: ({ page = 1, limit = 10, status = 'published' } = {}) => 
        `/papers?assigned=true&status=${status}&page=${page}&limit=${limit}`,
      providesTags: ['Papers'],
    }),
    
    // Publish/Unpublish paper
    togglePaperStatus: builder.mutation({
      query: ({ id, isPublished }) => ({
        url: `/papers/${id}`,
        method: 'PUT',
        body: { 'settings.isPublished': isPublished },
      }),
      invalidatesTags: (result, error, { id }) => [
        'Papers',
        { type: 'Paper', id },
      ],
    }),
    
    // Assign paper to students
    assignPaper: builder.mutation({
      query: ({ paperId, studentIds }) => ({
        url: `/papers/${paperId}/assign`,
        method: 'POST',
        body: { studentIds },
      }),
      invalidatesTags: (result, error, { paperId }) => [
        'Papers',
        { type: 'Paper', id: paperId },
      ],
    }),
    
  }),
});

export const {
  useGetPapersQuery,
  useGetPaperByIdQuery,
  useCreatePaperMutation,
  useUpdatePaperMutation,
  useDeletePaperMutation,
  useGetMyPapersQuery,
  useGetAssignedPapersQuery,
  useTogglePaperStatusMutation,
  useAssignPaperMutation,
} = paperApi;