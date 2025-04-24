import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import authRouter from './api/auth'; // Import the authentication routes
import transactionRouter from './api/transactions'; // Import transaction routes
import reportRouter from './api/reports'; // Import report routes

// Load environment variables from .env file
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001; // Use port from env or default to 3001

// Middleware to parse JSON bodies
app.use(express.json());

// Mount API routers
app.use('/api', authRouter); // Mount auth routes under /api prefix (e.g., /api/login)
app.use('/api/transactions', transactionRouter); // Mount transaction routes
app.use('/api/reports', reportRouter); // Mount report routes

// Basic root route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Financial Transaction Audit System Server is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

// Export the app for testing purposes
export default app;

// Optional: Add basic error handling middleware later if needed
