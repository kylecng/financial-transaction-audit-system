import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input'; // Using alias configured by shadcn/ui setup
import { Button } from '@/components/ui/button'; // Using alias configured by shadcn/ui setup
import { Label } from '@/components/ui/label'; // Using alias configured by shadcn/ui setup
import { useAuthStore } from '@/stores/authStore'; // Using alias configured by shadcn/ui setup

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Get state and actions from the auth store
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  // Removed clearError as it doesn't exist in the store

  // Handle redirection on successful login
  useEffect(() => {
    if (user) {
      // Error state is handled by the login action itself
      // Redirect based on role
      if (user.role === 'auditor') {
        navigate('/transactions');
      } else if (user.role === 'transactor') {
        // Redirect transactors to log transaction page as per requirement
        navigate('/log-transaction');
      } else {
        // Fallback or handle other roles if necessary
        navigate('/'); // Or a default dashboard
      }
    }
  }, [user, navigate, error]); // Removed clearError from dependencies

  // Removed cleanup useEffect for clearError

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    // Error message persists until next login attempt, which is fine.
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Error message persists until next login attempt, which is fine.
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      // Basic validation - could enhance later
      return;
    }
    // The login action itself resets the error state before the API call
    await login(username, password);
    // Redirection is handled by the useEffect hook watching the 'user' state
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={handleUsernameChange}
          required
          disabled={isLoading}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
          required
          disabled={isLoading}
          className="w-full"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};

export default LoginForm;
