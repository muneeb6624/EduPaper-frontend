import { configureStore } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { paperApi } from '../features/papers/paperApi';
import { attemptApi } from '../features/attempts/attemptApi';
import { resultApi } from '../features/results/resultApi';
import { userApi } from '../features/User/userApi';
import { notificationApi } from '../features/notifications/notificationApi';

// Create the main API slice
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', // Point to your backend
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
    [userApi.reducerPath]: userApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    user: userApi.reducer, // Add user as a reducer
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
      resultApi.middleware,
      userApi.middleware,
      notificationApi.middleware,
    ),
});

export default store;
