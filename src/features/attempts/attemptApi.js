import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
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
    startAttempt: builder.mutation({
      query: (paperId) => ({
        url: `/papers/${paperId}/attempt`,
        method: 'GET',
      }),
      invalidatesTags: ['Attempt'],
    }),

    submitAttempt: builder.mutation({
      query: ({ paperId, answers }) => ({
        url: `/papers/${paperId}/submit`,
        method: 'POST',
        body: { answers },
      }),
      invalidatesTags: ['Attempt'],
    }),

    gradeAttempt: builder.mutation({
      query: ({ id, gradedAnswers }) => ({
        url: `/attempts/${id}/grade`,
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
  useGradeAttemptMutation,
} = attemptApi;