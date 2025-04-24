import express, { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import {
  createTransaction,
  getTransactions,
} from '../services/transactionService'; // Import getTransactions
import { Transaction, TransactionFilters, User } from '../types'; // Import necessary types

const router: Router = express.Router();

// POST /api/transactions - Log a new transaction (Transactor only)
// Apply authentication first, then role authorization
router.post(
  '/',
  authenticateToken,
  authorizeRole(['transactor']), // Only transactors can log transactions
  async (req: Request, res: Response, next: NextFunction) => {
    // Input validation
    const {
      transactionType,
      amount,
      currency,
      accountId,
      transactionTimestamp,
      description,
      sourceSystem,
    }: Omit<Transaction, 'id' | 'createdAt' | 'createdById'> = req.body;

    // Basic validation checks
    if (
      !transactionType ||
      typeof transactionType !== 'string' ||
      amount === undefined || // Check for undefined explicitly as 0 is a valid amount
      typeof amount !== 'number' ||
      !currency ||
      typeof currency !== 'string' ||
      !accountId ||
      typeof accountId !== 'string' ||
      !transactionTimestamp ||
      typeof transactionTimestamp !== 'string' || // Expecting ISO string or similar
      isNaN(Date.parse(transactionTimestamp)) // Validate date string format
    ) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing or invalid required transaction fields.',
      });
    }

    // Optional fields validation (type check if present)
    if (description && typeof description !== 'string') {
      return res
        .status(400)
        .json({ error: 'Bad Request', message: 'Invalid description format.' });
    }
    if (sourceSystem && typeof sourceSystem !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid sourceSystem format.',
      });
    }

    // Ensure req.user exists (should be guaranteed by authenticateToken)
    if (!req.user || !req.user.id) {
      // This case should technically be handled by middleware, but good practice to check
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'User not authenticated.' });
    }

    try {
      const transactionData = {
        transactionType,
        amount,
        currency,
        accountId,
        transactionTimestamp, // Pass as string/Date, service handles conversion
        description: description ?? null, // Use null if undefined
        sourceSystem: sourceSystem ?? null, // Use null if undefined
      };

      const newTransaction = await createTransaction(
        transactionData,
        req.user.id
      );

      // Return success response with the ID of the created transaction
      res.status(201).json({ transactionId: newTransaction.id });
    } catch (error) {
      console.error('Failed to log transaction:', error);
      // Pass error to a generic error handler or return a 500 status
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to log transaction.',
      });
      // Optionally use next(error) if you have a centralized error handling middleware
    }
  }
);

// GET /api/transactions - Fetch transactions (Both roles, logic differs in service)
// Apply authentication first. Role-specific data filtering happens in the service layer.
router.get(
  '/',
  authenticateToken,
  // No specific authorizeRole here, as both roles can access this endpoint.
  // The service layer will handle filtering based on req.user.role and req.user.id.
  async (req: Request, res: Response) => {
    // Ensure user is authenticated (should be guaranteed by middleware)
    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'Authentication required.' });
    }

    // --- Parse and Validate Query Parameters ---

    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
    if (page <= 0 || pageSize <= 0 || pageSize > 100) {
      // Add a max page size limit
      return res.status(400).json({
        error: 'Bad Request',
        message:
          'Invalid pagination parameters. Page and pageSize must be positive, pageSize <= 100.',
      });
    }
    const pagination = { page, pageSize };

    // Filters
    const filters: TransactionFilters = {};
    if (
      req.query.transactionType &&
      typeof req.query.transactionType === 'string'
    ) {
      filters.transactionType = req.query.transactionType;
    }
    if (req.query.accountId && typeof req.query.accountId === 'string') {
      filters.accountId = req.query.accountId;
    }
    // Basic date validation - ensure it can be parsed
    if (
      req.query.startDate &&
      typeof req.query.startDate === 'string' &&
      !isNaN(Date.parse(req.query.startDate))
    ) {
      filters.startDate = req.query.startDate;
    } else if (req.query.startDate) {
      return res
        .status(400)
        .json({ error: 'Bad Request', message: 'Invalid startDate format.' });
    }
    if (
      req.query.endDate &&
      typeof req.query.endDate === 'string' &&
      !isNaN(Date.parse(req.query.endDate))
    ) {
      filters.endDate = req.query.endDate;
    } else if (req.query.endDate) {
      return res
        .status(400)
        .json({ error: 'Bad Request', message: 'Invalid endDate format.' });
    }
    // Basic number validation
    if (req.query.minAmount) {
      const minAmountVal = parseFloat(req.query.minAmount as string);
      if (!isNaN(minAmountVal)) {
        filters.minAmount = minAmountVal;
      } else {
        return res
          .status(400)
          .json({ error: 'Bad Request', message: 'Invalid minAmount format.' });
      }
    }
    if (req.query.maxAmount) {
      const maxAmountVal = parseFloat(req.query.maxAmount as string);
      if (!isNaN(maxAmountVal)) {
        filters.maxAmount = maxAmountVal;
      } else {
        return res
          .status(400)
          .json({ error: 'Bad Request', message: 'Invalid maxAmount format.' });
      }
    }
    if (req.query.keyword && typeof req.query.keyword === 'string') {
      filters.keyword = req.query.keyword;
    }

    // --- Call Service Layer ---
    try {
      // Cast req.user to User type, assuming authenticateToken populates it correctly
      const user = req.user as User;
      const result = await getTransactions(filters, pagination, user);

      res.status(200).json(result); // { data: Transaction[], totalCount: number }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch transactions.',
      });
    }
  }
);

export default router;
