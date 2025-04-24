import React, { useRef, useCallback } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState, // Import PaginationState type
} from '@tanstack/react-table';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types'; // Assuming types are defined here

interface TransactionTableProps {
  columns: ColumnDef<Transaction>[];
  data: Transaction[];
  isLoading: boolean;
  error: string | null;
  pagination: { currentPage: number; pageSize: number; totalCount: number };
  onPageChange: (page: number) => void;
}

const ROW_HEIGHT = 52; // Estimated height of a row in pixels (adjust as needed)
const TABLE_HEIGHT = 600; // Desired height of the virtualized table area

const TransactionTable: React.FC<TransactionTableProps> = ({
  columns,
  data,
  isLoading,
  error,
  pagination,
  onPageChange,
}) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);

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

  // Function to render a single row for react-window
  const RenderRow = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const row = rows[index];
      if (!row) {
        return null; // Should not happen if itemCount is correct
      }
      return (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && 'selected'}
          style={style} // Apply style from react-window for positioning
          className="flex" // Use flex for horizontal layout within the fixed height
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell
              key={cell.id}
              className="flex items-center p-2" // Adjust padding as needed
              // Apply width if defined in columnDef, otherwise flex-1
              style={{
                width: cell.column.getSize(),
                flex: cell.column.getSize() ? 'none' : 1,
              }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      );
    },
    [rows] // Dependency on rows
  );

  // Calculate the height for the FixedSizeList container
  // Use TABLE_HEIGHT or the calculated height based on rows if less than TABLE_HEIGHT
  const listHeight = Math.min(TABLE_HEIGHT, rows.length * ROW_HEIGHT);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div ref={tableContainerRef}>
          {/* Ref for potential width calculations */}
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
            {/* Virtualized Table Body */}
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
                <FixedSizeList
                  height={listHeight} // Use calculated height
                  itemCount={rows.length}
                  itemSize={ROW_HEIGHT}
                  width="100%" // Take full width of container
                >
                  {RenderRow}
                </FixedSizeList>
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
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pageCount} (
            {pagination.totalCount} total transactions)
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
      )}
    </div>
  );
};

export default TransactionTable;
