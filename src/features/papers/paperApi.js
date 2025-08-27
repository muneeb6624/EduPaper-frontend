import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const paperApi = createApi({
  reducerPath: 'paperApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/papers',
  }),
  tagTypes: ['Paper'],
  endpoints: (builder) => ({
    getPapers: builder.query({
      query: () => '/papers',
      providesTags: ['Paper'],
    }),

    getPaperById: builder.query({
      query: (id) => `/papers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Paper', id }],
    }),

    createPaper: builder.mutation({
      query: (paperData) => ({
        url: '/papers',
        method: 'POST',
        body: paperData,
      }),
      invalidatesTags: ['Paper'],
    }),

    updatePaper: builder.mutation({
      query: ({ id, ...paperData }) => ({
        url: `/papers/${id}`,
        method: 'PUT',
        body: paperData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Paper', id }],
    }),

    deletePaper: builder.mutation({
      query: (id) => ({
        url: `/papers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Paper'],
    }),

    assignPaper: builder.mutation({
      query: ({ id, studentIds }) => ({
        url: `/papers/${id}/assign`,
        method: 'POST',
        body: { studentIds },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Paper', id }],
    }),
  }),
});

export const {
  useGetPapersQuery,
  useGetPaperByIdQuery,
  useCreatePaperMutation,
  useUpdatePaperMutation,
  useDeletePaperMutation,
  useAssignPaperMutation,
} = paperApi;