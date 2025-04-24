// User type based on the Prisma User model (excluding sensitive fields like passwordHash)
export interface User {
  id: number;
  username: string;
  role: 'auditor' | 'transactor'; // Explicitly define possible roles
}

// Transaction type based on the Prisma Transaction model
export interface Transaction {
  id: number;
  transactionType: string;
  amount: number; // Representing Decimal from Prisma, handle conversion if needed
  currency: string;
  accountId: string;
  transactionTimestamp: string | Date; // Can be string from API, or Date object
  description: string | null;
  sourceSystem: string | null;
  createdAt: string | Date; // Can be string from API, or Date object
  createdById: number;
}

// Types for fetching lists with pagination
export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
}

// Types for transaction filters (used in frontend state and backend query params)
export interface TransactionFilters {
  transactionType?: string;
  accountId?: string;
  startDate?: string; // ISO date string or similar
  endDate?: string; // ISO date string or similar
  minAmount?: number;
  maxAmount?: number;
  keyword?: string; // For searching description, etc.
  createdById?: number; // Add optional filter for creator user ID (for auditors)
}

// Types for pagination state (frontend)
export interface PaginationState {
  currentPage: number; // 1-based index
  pageSize: number;
  totalCount: number; // Total count based on current filters AND role
}
