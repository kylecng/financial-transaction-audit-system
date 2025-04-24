import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TransactionListPage from './pages/TransactionListPage';
import LogTransactionPage from './pages/LogTransactionPage';
import ReportPage from './pages/ReportPage';
import AuthGuard from './components/AuthGuard';
import { useAuthStore } from './stores/authStore'; // Import auth store to check initial state

// Optional: A simple layout component if needed
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="container mx-auto p-4">
    {/* Add common elements like Navbar here if desired */}
    {children}
  </div>
);

function App() {
  // You might want to initialize auth state here if needed, e.g., check for token
  const { user } = useAuthStore.getState(); // Get initial state synchronously if needed, or use hook inside components

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<AuthGuard />}>
            {/* Generic auth check */}
            <Route path="/transactions" element={<TransactionListPage />} />
          </Route>

          <Route element={<AuthGuard allowedRoles={['transactor']} />}>
            {/* Transactor only */}
            <Route path="/log-transaction" element={<LogTransactionPage />} />
          </Route>

          <Route element={<AuthGuard allowedRoles={['auditor']} />}>
            {/* Auditor only */}
            <Route path="/reports" element={<ReportPage />} />
          </Route>

          {/* Fallback Route */}
          {/* If logged in, redirect to transactions, otherwise redirect to login */}
          <Route
            path="*"
            element={
              <Navigate to={user ? '/transactions' : '/login'} replace />
            }
          />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
