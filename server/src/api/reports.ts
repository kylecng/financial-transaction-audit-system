import express, { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { getReportTransactions } from '../services/transactionService';
import { TransactionFilters } from '../types'; // Import TransactionFilters type

const router: Router = express.Router();

// GET /api/reports - Fetch filtered transaction data for reporting (Auditor only)
// Apply authentication first, then role authorization
router.get(
  '/',
  authenticateToken,
  authorizeRole(['auditor']), // Only auditors can access reports
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract and type-cast filter query parameters
      const filters: TransactionFilters = {
        transactionType: req.query.transactionType as string | undefined,
        accountId: req.query.accountId as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        minAmount: req.query.minAmount
          ? parseFloat(req.query.minAmount as string)
          : undefined,
        maxAmount: req.query.maxAmount
          ? parseFloat(req.query.maxAmount as string)
          : undefined,
        keyword: req.query.keyword as string | undefined,
      };

      // Remove undefined keys to avoid passing them to the service
      Object.keys(filters).forEach(
        (key) =>
          filters[key as keyof TransactionFilters] === undefined &&
          delete filters[key as keyof TransactionFilters]
      );

      // Fetch report data using the service function
      const reportData = await getReportTransactions(filters);

      // Respond with the fetched data as JSON
      // TODO: Consider adding CSV formatting based on Accept header or query param if needed later
      res.status(200).json(reportData);
    } catch (error) {
      console.error('Error fetching report:', error);
      // Pass error to a generic error handler (if one exists) or return a 500 response
      // For now, return a generic 500 error
      res.status(500).json({
        error: 'Internal Server Error',
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while generating the report.',
      });
      // Alternatively, use next(error) if you have a dedicated error handling middleware
      // next(error);
    }
  }
);

export default router;
