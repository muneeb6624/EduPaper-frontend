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

export const resultApi = createApi({
  reducerPath: 'resultApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/results',
  }),
  tagTypes: ['Result'],
  endpoints: (builder) => ({
    getStudentResults: builder.query({
      query: (studentId) => `/results/student/${studentId}`,
      providesTags: ['Result'],
    }),

    getClassResults: builder.query({
      query: (paperId) => `/results/class/${paperId}`,
      providesTags: ['Result'],
    }),

    getResultById: builder.query({
      query: (id) => `/results/${id}`,
      providesTags: (result, error, id) => [{ type: 'Result', id }],
    }),
  }),
});

export const {
  useGetStudentResultsQuery,
  useGetClassResultsQuery,
  useGetResultByIdQuery,
} = resultApi;