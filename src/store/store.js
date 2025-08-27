import { configureStore } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { paperApi } from '../features/papers/paperApi';
import { attemptApi } from '../features/attempts/attemptApi';
import { resultApi } from '../features/results/resultApi';

// Create the main API slice
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api', // Point to your backend
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Paper', 'Attempt', 'Result'],
  endpoints: () => ({}),
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [paperApi.reducerPath]: paperApi.reducer,
    [attemptApi.reducerPath]: attemptApi.reducer,
    [resultApi.reducerPath]: resultApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(
      authApi.middleware,
      paperApi.middleware,
      attemptApi.middleware,
      resultApi.middleware
    ),
});

export default store;