import { create } from 'zustand';
import axios from 'axios';
import { User } from '../types';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<void>; // Changed to Promise<void>
}

const AUTH_TOKEN_KEY = 'authToken'; // Key for localStorage

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  token: null,
  isLoading: true, // Start with loading true during initialization
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<{ user: User; token: string }>(
        '/api/login', // Assuming API is served from the same origin or proxied
        { username, password }
      );
      const { user, token } = response.data;

      localStorage.setItem(AUTH_TOKEN_KEY, token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      set({ user, token, isLoading: false, error: null });
    } catch (err) {
      let errorMessage = 'Login failed. Please check your credentials.';
      if (axios.isAxiosError(err) && err.response) {
        // Use error message from backend if available
        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      console.error('Login error:', err);
      localStorage.removeItem(AUTH_TOKEN_KEY); // Clear token on failure
      delete axios.defaults.headers.common['Authorization'];
      set({ error: errorMessage, isLoading: false, user: null, token: null });
      // Optionally re-throw or handle specific error types
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
    set({ user: null, token: null, error: null, isLoading: false }); // Ensure isLoading is false on logout
  },

  // Modified initializeAuth to be async and fetch user data
  initializeAuth: async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      set({ isLoading: true, error: null }); // Set loading true while verifying token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        // Assume an endpoint '/api/me' or similar exists to get user data from token
        const response = await axios.get<{ user: User }>('/api/me');
        set({ user: response.data.user, token, isLoading: false, error: null });
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Token is invalid or expired, or API is down
        localStorage.removeItem(AUTH_TOKEN_KEY);
        delete axios.defaults.headers.common['Authorization'];
        set({
          user: null,
          token: null,
          isLoading: false,
          error: 'Session expired or invalid. Please log in again.',
        });
      }
    } else {
      // No token found, ensure state is clean and not loading
      set({ user: null, token: null, isLoading: false, error: null });
    }
  },
}));

// Initialize auth state when the app loads
// This triggers the async function. Components might initially see isLoading=true
// until the user data is fetched or an error occurs.
useAuthStore.getState().initializeAuth();
