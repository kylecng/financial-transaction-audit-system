import { Router, Request, Response } from 'express';
import { authenticateUser } from '../services/authService';
import { generateToken } from '../utils/authUtils';
import { User } from '../types'; // Import User type for response structure

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

export default router;
