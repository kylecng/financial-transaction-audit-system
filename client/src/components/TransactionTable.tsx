import React, { useRef, useState, useEffect } from 'react'; // Added useEffect back
import { useTransactionStore } from '@/stores/transactionStore';
import { useAuthStore } from '@/stores/authStore'; // Import auth store
import { useShallow } from 'zustand/react/shallow';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState, // Use Tanstack's PaginationState
} from '@tanstack/react-table';
// Removed: import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { format } from 'date-fns'; // Import date-fns format function

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Import Select components
import { Transaction } from '@/types'; // Assuming types are defined here
import ReportDialog from './ReportDialog'; // Import the ReportDialog component
import LogTransactionDialog from './LogTransactionDialog'; // Import the new LogTransactionDialog component

interface TransactionTableProps {
  columns: ColumnDef<Transaction>[];
  data: Transaction[];
  isLoading: boolean;
  error: string | null;
  pagination: { currentPage: number; pageSize: number; totalCount: number };
  onPageChange: (page: number) => void;
  // Added prop to trigger data refresh after logging
  refreshData: () => void;
}

// Removed: const ROW_HEIGHT = 52;
// Removed: const TABLE_HEIGHT = 520;

const TransactionTable: React.FC<TransactionTableProps> = ({
  columns,
  data,
  isLoading,
  error,
  pagination,
  onPageChange,
  refreshData, // Destructure refreshData prop
}) => {
  // Removed: const tableContainerRef = useRef<HTMLDivElement>(null); - Keep if used elsewhere, remove if only for react-window
  const tableContainerRef = useRef<HTMLDivElement>(null); // Keep ref if needed for other purposes
  // State for dialogs
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false); // State for log dialog

  // Get user from auth store
  const user = useAuthStore((state) => state.user);

  // Add useEffect to log data changes
  useEffect(() => {
    console.log('Transaction data changed:', data);
  }, [data]); // Dependency array includes data

  // Get actions and state from the transaction store using useShallow
  const {
    setPageSize,
    generateReport,
    clearReport,
    reportData,
    isGeneratingReport,
    reportError,
    // No need for log transaction state here, dialog handles it
  } = useTransactionStore(
    useShallow((state) => ({
      setPageSize: state.setPageSize,
      generateReport: state.generateReport,
      clearReport: state.clearReport,
      reportData: state.reportData,
      isGeneratingReport: state.isGeneratingReport,
      reportError: state.reportError,
    }))
  );

  // Adapt Zustand pagination (1-based) to @tanstack/react-table (0-based)
  const tablePagination: PaginationState = {
    pageIndex: pagination.currentPage - 1,
    pageSize: pagination.pageSize,
  };

  // Calculate total pages
  const pageCount = Math.ceil(pagination.totalCount / pagination.pageSize);

  const table = useReactTable({
    data: data ?? [], // Provide default empty array if data is null/undefined
    columns,
    state: {
      pagination: tablePagination,
    },
    pageCount: pageCount, // Set the total page count
    manualPagination: true, // We handle pagination externally (Zustand)
    getCoreRowModel: getCoreRowModel(),
    // No need for onPaginationChange here as we drive it from Zustand
  });

  const { rows } = table.getRowModel();

  // Removed: const RenderRow = useCallback(...) function

  // Removed: const listHeight = pagination.pageSize * ROW_HEIGHT;

  // Handler for the Generate Report button
  const handleGenerateReportClick = () => {
    generateReport(); // Start generation
    setIsReportDialogOpen(true); // Open the dialog
  };

  // Handler for closing the report dialog
  const handleReportDialogClose = (open: boolean) => {
    if (!open) {
      clearReport(); // Clear report data when dialog closes
    }
    setIsReportDialogOpen(open);
  };

  // Handler for the Log New Transaction button
  const handleLogTransactionClick = () => {
    setIsLogDialogOpen(true); // Open the log dialog
  };

  // Handler for closing the log dialog
  const handleLogDialogClose = (open: boolean) => {
    setIsLogDialogOpen(open);
  };

  // Handler for successful transaction logging
  const handleLogSuccess = () => {
    // Optional: Add a small delay before refreshing if needed
    refreshData(); // Call the refresh function passed as prop
    // Dialog closes itself on success
  };

  // Clear report data when the component unmounts (optional, depends on desired behavior)
  // useEffect(() => {
  //   return () => {
  //     clearReport();
  //   };
  // }, [clearReport]);

  return (
    <div className="space-y-4">
      {/* Conditional Buttons - Top Right */}
      <div className="flex justify-end space-x-2">
        {user?.role === 'auditor' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReportClick}
            disabled={isGeneratingReport || isLoading || !!error}
          >
            {isGeneratingReport ? 'Generating...' : 'Generate Report'}
          </Button>
        )}
        {user?.role === 'transactor' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogTransactionClick}
            disabled={isLoading || !!error} // Disable if loading data or error
          >
            Log New Transaction
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        {/* Removed: ref={tableContainerRef} from this div if only used for react-window width */}
        <div ref={tableContainerRef}>
          {' '}
          {/* Keep ref if needed for other layout calculations */}
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="flex">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="flex items-center p-2" // Adjust padding
                      style={{
                        width: header.getSize(),
                        flex: header.getSize() ? 'none' : 1,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            {/* Standard Table Body */}
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-red-500"
                  >
                    Error loading transactions: {error}
                  </TableCell>
                </TableRow>
              ) : rows.length > 0 ? (
                // Map rows directly
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="flex" // Keep flex if you want horizontal layout control within row
                  >
                    {row.getVisibleCells().map((cell) => {
                      // --- Start: Copied logic from RenderRow ---
                      const isDateColumn = [
                        'transactionTimestamp',
                        'createdAt',
                      ].includes(cell.column.id);
                      const isDescriptionColumn =
                        cell.column.id === 'description';
                      const cellValue = cell.getValue();
                      let formattedValue: React.ReactNode;

                      if (isDateColumn && cellValue) {
                        try {
                          formattedValue = format(
                            new Date(cellValue as string | Date),
                            'MM/dd/yy HH:mm'
                          );
                        } catch {
                          console.error(
                            `Invalid date value for column ${cell.column.id}:`,
                            cellValue
                          );
                          formattedValue = 'Invalid Date';
                        }
                      } else {
                        formattedValue = flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        );
                      }

                      const descriptionClasses = isDescriptionColumn
                        ? 'whitespace-nowrap overflow-hidden text-ellipsis'
                        : '';
                      // --- End: Copied logic from RenderRow ---

                      return (
                        <TableCell
                          key={cell.id}
                          className={`flex items-center p-2 ${descriptionClasses}`}
                          style={{
                            width: cell.column.getSize(),
                            flex: cell.column.getSize() ? 'none' : 1,
                          }}
                          title={
                            isDescriptionColumn && typeof cellValue === 'string'
                              ? cellValue
                              : undefined
                          }
                        >
                          {formattedValue}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Pagination Controls */}
      {!isLoading && !error && pagination.totalCount > 0 && (
        <div className="flex items-center justify-between space-x-4 py-4">
          {/* Increased space */}
          <div className="flex items-center space-x-2">
            {/* Group page info and selector */}
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            {/* Group page count and buttons */}
            <div className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pageCount} (
              {pagination.totalCount} total)
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pageCount}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Render Dialogs */}
      {user?.role === 'auditor' && (
        <ReportDialog
          open={isReportDialogOpen}
          onOpenChange={handleReportDialogClose}
          reportData={reportData}
          isLoading={isGeneratingReport}
          error={reportError}
        />
      )}
      {user?.role === 'transactor' && (
        <LogTransactionDialog
          open={isLogDialogOpen}
          onOpenChange={handleLogDialogClose}
          onSuccess={handleLogSuccess} // Pass the success handler
        />
      )}
    </div>
  );
};

export default TransactionTable;
