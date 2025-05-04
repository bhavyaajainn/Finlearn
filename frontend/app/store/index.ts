import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these specific action types
        ignoredActions: [
          'auth/signInWithGoogle/pending',
          'auth/signInWithGoogle/fulfilled', 
          'auth/signInWithGoogle/rejected',
          'auth/signInWithEmail/pending',
          'auth/signInWithEmail/fulfilled',
          'auth/signInWithEmail/rejected',
          'auth/signUpWithEmail/pending',
          'auth/signUpWithEmail/fulfilled',
          'auth/signUpWithEmail/rejected',
          'auth/signOut/pending',
          'auth/signOut/fulfilled',
          'auth/signOut/rejected',
          'auth/checkAuthState/pending',
          'auth/checkAuthState/fulfilled',
          'auth/checkAuthState/rejected',
          'auth/setUser'
        ],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;