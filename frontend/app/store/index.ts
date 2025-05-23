import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import learningReducer from './slices/learningSlice';
import preferencesReducer from './slices/preferencesSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    learning: learningReducer,
    preferences: preferencesReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        
        ignoredActions: [
          
          'auth/signInWithGoogle/fulfilled',
          'auth/signInWithEmail/fulfilled',
          'auth/signUpWithEmail/fulfilled',
          'auth/checkAuthState/fulfilled',
          'auth/setUser',
        ],
        
        ignoredPaths: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;