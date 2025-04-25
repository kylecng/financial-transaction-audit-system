import { Router, Request, Response } from 'express';
import { authenticateUser, getUserById } from '../services/authService'; // Import getUserById
import { generateToken } from '../utils/authUtils';
import { User } from '../types'; // Import User type for response structure
import { authenticateToken } from '../middleware/auth'; // Import authentication middleware

const router = Router();

// POST /api/login
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Username and password are required.',
    });
  }

  try {
    // Authenticate user using the service
    const user: User | null = await authenticateUser(username, password);

    if (!user) {
      // Authentication failed (user not found or invalid password)
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password.',
      });
    }

    // Generate JWT token
    const token = generateToken({ id: user.id, role: user.role });

    // Send successful response with token and user info (excluding sensitive data)
    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during login.',
    });
  }
});

// GET /api/me - Fetch current user details
router.get(
  '/me',
  authenticateToken, // Apply authentication middleware
  async (req: Request, res: Response) => {
    // req.user should be populated by authenticateToken middleware
    if (!req.user) {
      // This should technically not be reached if middleware is working
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
    }

    try {
      const user = await getUserById(req.user.id);

      if (!user) {
        // User associated with token not found in DB (edge case)
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found.',
        });
      }

      // Return the user details (excluding sensitive info like password hash)
      res.status(200).json({ user });
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch user details.',
      });
    }
  }
);

export default router;
