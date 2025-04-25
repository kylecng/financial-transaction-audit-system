import React, { useEffect, useMemo, useCallback } from 'react'; // Added useCallback
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useFilterStore } from '@/stores/filterStore';
import { Transaction } from '@/types'; // Assuming types are defined in @/types
import { ColumnDef } from '@tanstack/react-table';
import FilterControls from '@/components/FilterControls'; // Import the actual component
import TransactionTable from '@/components/TransactionTable'; // Import the actual component

// --- Removed Placeholder Components ---

const TransactionListPage: React.FC = () => {
  // Get state and actions from Zustand stores
  const user = useAuthStore((state) => state.user); // Needed for potential role-specific UI, though backend handles data scoping
  console.log('Current user role:', user?.role); // Use user variable to satisfy ESLint for now
  const {
    transactions,
    isLoading,
    error,
    pagination,
    fetchTransactions, // Keep fetchTransactions
    setCurrentPage,
  } = useTransactionStore();
  const filters = useFilterStore((state) => state.filters);

  // Define columns for the @tanstack/react-table
  // Using useMemo to prevent redefining columns on every render
  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'transactionType', header: 'Type' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        // Basic cell formatting example (can be enhanced)
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('amount'));
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: row.original.currency || 'USD', // Use transaction currency or default
          }).format(amount);
          return <div className="text-right font-medium">{formatted}</div>;
        },
      },
      // { accessorKey: 'currency', header: 'Currency' }, // Hide currency column for now
      { accessorKey: 'accountId', header: 'Account ID' },
      {
        accessorKey: 'transactionTimestamp',
        header: 'Timestamp',
        cell: ({ row }) =>
          new Date(row.getValue('transactionTimestamp')).toLocaleString(),
      },
      { accessorKey: 'description', header: 'Description' },
      { accessorKey: 'sourceSystem', header: 'Source System' },
      {
        accessorKey: 'createdAt',
        header: 'Logged At',
        cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleString(),
      },
      { accessorKey: 'createdById', header: 'Logged By (ID)' },
    ],
    []
  ); // Empty dependency array means this runs once

  // Effect to fetch transactions when component mounts or dependencies change
  useEffect(() => {
    // fetchTransactions internally uses filters and pagination state from the store
    fetchTransactions();
  }, [fetchTransactions, filters, pagination.currentPage, pagination.pageSize]);

  // Handler for page changes triggered by the table/pagination component
  const handlePageChange = (newPage: number) => {
    // Basic validation, ensure page number is positive
    if (newPage > 0) {
      setCurrentPage(newPage);
      // fetchTransactions will be triggered by the useEffect hook above
      // due to pagination.currentPage changing
    }
  };

  // Function to refresh data - calls fetchTransactions
  // Use useCallback to memoize the function if needed, though fetchTransactions itself should be stable from Zustand
  const refreshData = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>

      {/* Render Filter Controls */}
      {/* The FilterControls component itself can access authStore if needed */}
      {/* to slightly adjust UI, but data filtering happens backend-side */}
      <FilterControls />

      {/* Render Transaction Table */}
      <TransactionTable
        columns={columns}
        data={transactions} // Data from the store
        isLoading={isLoading} // Loading state from the store
        error={error} // Error state from the store
        pagination={pagination} // Pagination state from the store
        onPageChange={handlePageChange} // Pass page change handler
        refreshData={refreshData} // Pass the refreshData function
      />
    </div>
  );
};

export default TransactionListPage;
