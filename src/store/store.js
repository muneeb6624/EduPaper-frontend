
import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../features/auth/authApi';
import { paperApi } from '../features/papers/paperApi';
import { attemptApi } from '../features/attempts/attemptApi';
import { resultApi } from '../features/results/resultApi';
import authReducer from '../features/auth/authSlice';

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
