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
  // Optional: Action to initialize state from storage on app load
  initializeAuth: () => void;
}

const AUTH_TOKEN_KEY = 'authToken'; // Key for localStorage

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<{ user: User; token: string }>(
        '/api/login', // Assuming API is served from the same origin or proxied
        { username, password }
      );
      const { user, token } = response.data;

      localStorage.setItem(AUTH_TOKEN_KEY, token); // Persist token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set default header for subsequent requests

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
    set({ user: null, token: null, error: null });
  },

  initializeAuth: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      // Basic check: If token exists, assume it's valid for now.
      // A better approach would be to verify the token against the backend
      // or decode it to get user info if the backend doesn't provide it on login.
      // For simplicity here, we just set the token. We might need user info too.
      // If the backend returns user info on login, we should store that too.
      // Let's assume for now the token is enough to indicate logged-in status,
      // and protected routes/components will fetch user details if needed or rely on backend validation.
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // We don't have the user object here unless we stored it or decode the JWT (if safe)
      // Setting a placeholder or fetching user details might be needed.
      // For now, just setting the token. The user object remains null until a proper login or fetch.
      set({ token });
      // TODO: Consider fetching user details here if the token is valid
      // e.g., call a '/api/me' endpoint
    }
  },
}));

// Initialize auth state when the app loads
useAuthStore.getState().initializeAuth();
