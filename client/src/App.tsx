import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'; // Import Link
import LoginPage from './pages/LoginPage';
import TransactionListPage from './pages/TransactionListPage';
// Remove LogTransactionPage and ReportPage imports
// import LogTransactionPage from './pages/LogTransactionPage';
// import ReportPage from './pages/ReportPage';
import AuthGuard from './components/AuthGuard';
import { useAuthStore } from './stores/authStore';
import { Button } from '@/components/ui/button'; // Import Button for logout

// Define the Navigation Header component
const NavigationHeader: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-gray-100 p-4 mb-4 rounded shadow">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-semibold">Audit System</div>
        <div className="space-x-4">
          {user ? (
            <>
              <Link to="/transactions" className="hover:text-blue-600">
                Transactions
              </Link>
              {/* Remove conditional links for Log Transaction and Reports */}
              {/* {user.role === 'transactor' && (
                <Link to="/log-transaction" className="hover:text-blue-600">Log Transaction</Link>
              )}
              {user.role === 'auditor' && (
                <Link to="/reports" className="hover:text-blue-600">Reports</Link>
              )} */}
              <span className="text-gray-600">
                ({user.username} - {user.role})
              </span>
              <Button onClick={logout} variant="outline" size="sm">
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login" className="hover:text-blue-600">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

// Updated AppLayout to include the NavigationHeader
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    {' '}
    {/* Remove container mx-auto p-4 from here if Nav has its own container */}
    <NavigationHeader /> {/* Add the header here */}
    <main className="container mx-auto p-4">
      {' '}
      {/* Add main tag for content */}
      {children}
    </main>
  </div>
);

function App() {
  // You might want to initialize auth state here if needed, e.g., check for token
  // Use the hook inside components that need reactive updates
  // const user = useAuthStore((state) => state.user); // Use hook for reactivity if needed here

  // For the initial redirect logic, getState might be sufficient if App doesn't re-render often
  const { user: initialUser } = useAuthStore.getState();

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

          {/* Remove routes for Log Transaction and Reports */}
          {/* <Route element={<AuthGuard allowedRoles={['transactor']} />}> */}
          {/* Transactor only */}
          {/* <Route path="/log-transaction" element={<LogTransactionPage />} /> */}
          {/* </Route> */}

          {/* <Route element={<AuthGuard allowedRoles={['auditor']} />}> */}
          {/* Auditor only */}
          {/* <Route path="/reports" element={<ReportPage />} /> */}
          {/* </Route> */}

          {/* Fallback Route */}
          {/* If logged in, redirect based on role, otherwise redirect to login */}
          {/* Update fallback redirect logic as LogTransactionPage is removed */}
          <Route
            path="*"
            element={
              <Navigate to={initialUser ? '/transactions' : '/login'} replace />
              // Original logic: <Navigate to={initialUser ? (initialUser.role === 'transactor' ? '/log-transaction' : '/transactions') : '/login'} replace />
            }
          />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
