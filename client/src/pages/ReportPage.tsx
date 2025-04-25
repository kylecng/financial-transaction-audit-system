import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTransactionStore } from '@/stores/transactionStore';
import { useShallow } from 'zustand/react/shallow'; // Import useShallow
import { Transaction } from '@/types';

// Helper to format date strings (adjust format as needed)
const formatDate = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString(); // Example format
  } catch {
    // Remove unused variable 'e'
    return 'Invalid Date';
  }
};

// Helper to format currency (basic example)
const formatCurrency = (
  amount: number | undefined | null,
  currency: string | undefined | null
): string => {
  if (
    amount === undefined ||
    amount === null ||
    currency === undefined ||
    currency === null
  )
    return 'N/A';
  // Basic formatting, consider using Intl.NumberFormat for better localization
  return `${amount.toFixed(2)} ${currency}`;
};

const ReportPage: React.FC = () => {
  const {
    generateReport,
    clearReport,
    reportData,
    isGeneratingReport,
    reportError,
  } = useTransactionStore(
    useShallow((state) => ({
      // Wrap the selector with useShallow
      generateReport: state.generateReport,
      clearReport: state.clearReport,
      reportData: state.reportData,
      isGeneratingReport: state.isGeneratingReport,
      reportError: state.reportError,
    })) // Remove the second argument
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Clear report data when the component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (!isDialogOpen) {
        // Only clear if dialog is not open (covers unmount)
        clearReport();
      }
    };
  }, [isDialogOpen, clearReport]);

  const handleGenerateReport = () => {
    generateReport();
    // DialogTrigger will open the dialog automatically
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Clear report state when dialog is closed
      clearReport();
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Generate Transaction Report
      </h1>
      <p className="mb-6 text-muted-foreground">
        Generate a report based on the currently applied filters. This report
        includes all matching transactions.
      </p>

      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button onClick={handleGenerateReport} disabled={isGeneratingReport}>
            {isGeneratingReport ? 'Generating...' : 'Generate Report'}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Report</DialogTitle>
            <DialogDescription>
              This report contains all transactions matching the selected
              filters.
            </DialogDescription>
          </DialogHeader>

          {isGeneratingReport && (
            <p className="text-center p-4">Loading report data...</p>
          )}
          {reportError && (
            <p className="text-center p-4 text-red-600">Error: {reportError}</p>
          )}

          {reportData && !isGeneratingReport && !reportError && (
            <div className="mt-4">
              {reportData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Account ID</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Source System</TableHead>
                      <TableHead>Logged At</TableHead>
                      <TableHead>Logged By (ID)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((tx: Transaction) => (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.id}</TableCell>
                        <TableCell>{tx.transactionType}</TableCell>
                        <TableCell>
                          {formatCurrency(tx.amount, tx.currency)}
                        </TableCell>
                        <TableCell>{tx.accountId}</TableCell>
                        <TableCell>
                          {formatDate(tx.transactionTimestamp)}
                        </TableCell>
                        <TableCell>{tx.description ?? 'N/A'}</TableCell>
                        <TableCell>{tx.sourceSystem ?? 'N/A'}</TableCell>
                        <TableCell>{formatDate(tx.createdAt)}</TableCell>
                        <TableCell>{tx.createdById}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center p-4">
                  No transactions found matching the current filters.
                </p>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportPage;
