// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from '../features/auth/authApi';
import { paperApi } from '../features/papers/paperApi';
import { attemptApi } from '../features/attempts/attemptApi';
import { resultApi } from '../features/results/resultApi';
import { userApi } from '../features/User/userApi';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    // Auth slice (for storing user data and tokens)
    auth: authReducer,
    
    // API slices
    [authApi.reducerPath]: authApi.reducer,
    [paperApi.reducerPath]: paperApi.reducer,
    [attemptApi.reducerPath]: attemptApi.reducer,
    [resultApi.reducerPath]: resultApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat([
      authApi.middleware,
      paperApi.middleware,
      attemptApi.middleware,
      resultApi.middleware,
      userApi.middleware,
    ]),
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export default store;