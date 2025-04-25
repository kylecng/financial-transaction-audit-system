import React from 'react';
import { Download } from 'lucide-react'; // Import an icon for the button
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData: Transaction[] | null;
  isLoading: boolean;
  error: string | null;
}

const ReportDialog: React.FC<ReportDialogProps> = ({
  open,
  onOpenChange,
  reportData,
  isLoading,
  error,
}) => {
  // Function to handle CSV download
  const handleDownloadCsv = () => {
    if (!reportData || reportData.length === 0) return;

    // Define CSV headers
    const headers = [
      'ID',
      'Type',
      'Amount',
      'Currency',
      'Account ID',
      'Timestamp',
      'Description', // Add other relevant fields
      'Source System',
    ];
    const csvRows = [headers.join(',')]; // Start with header row

    // Convert transaction data to CSV rows
    reportData.forEach((tx) => {
      const row = [
        tx.id,
        `"${tx.transactionType}"`, // Enclose strings in quotes
        tx.amount.toFixed(2),
        `"${tx.currency}"`,
        `"${tx.accountId}"`,
        `"${new Date(tx.transactionTimestamp).toISOString()}"`, // Use ISO format for consistency
        `"${tx.description?.replace(/"/g, '""') ?? ''}"`, // Escape double quotes within description
        `"${tx.sourceSystem?.replace(/"/g, '""') ?? ''}"`, // Escape double quotes
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'transaction_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-start">
            {' '}
            {/* Flex container for title and button */}
            <div>
              {' '}
              {/* Container for title and description */}
              <DialogTitle>Transaction Report</DialogTitle>
              <DialogDescription>
                {isLoading
                  ? 'Generating report...'
                  : error
                    ? 'Error generating report.'
                    : 'Report generated based on current filters.'}
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCsv}
              disabled={
                isLoading || !!error || !reportData || reportData.length === 0
              }
              className="ml-auto" // Push button to the right
            >
              <Download className="mr-2 h-4 w-4" /> {/* Add icon */}
              Download CSV
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-grow overflow-auto p-4 border rounded-md my-4">
          {isLoading && (
            <p className="text-center p-4">Loading report data...</p>
          )}
          {error && (
            <p className="text-center p-4 text-red-500">Error: {error}</p>
          )}
          {/* Display report data */}
          {reportData &&
            !isLoading &&
            !error &&
            (reportData.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-right p-2">Amount</th>
                    <th className="text-left p-2">Currency</th>
                    <th className="text-left p-2">Account ID</th>
                    <th className="text-left p-2">Timestamp</th>
                    {/* Add more columns as needed */}
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Source System</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{tx.id}</td>
                      <td className="p-2">{tx.transactionType}</td>
                      <td className="text-right p-2">{tx.amount.toFixed(2)}</td>
                      <td className="p-2">{tx.currency}</td>
                      <td className="p-2">{tx.accountId}</td>
                      <td className="p-2">
                        {new Date(tx.transactionTimestamp).toLocaleString()}
                      </td>
                      {/* Render more data */}
                      <td className="p-2">{tx.description ?? '-'}</td>
                      <td className="p-2">{tx.sourceSystem ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center p-4">
                No transactions found matching the current filters.
              </p>
            ))}
          {/* Optional: Message when report hasn't been generated yet (if dialog could open before first generation) */}
          {/* {!isLoading && !error && !reportData && (
            <p className="text-center p-4">Report not generated yet.</p>
          )} */}
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
          {' '}
          {/* Adjusted alignment */}
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          {/* Removed the Generate Report button from here */}
          {/* <Button
            type="button"
            onClick={onGenerateReport}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Report'}
          </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
