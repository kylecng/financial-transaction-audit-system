import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Define the structure of the user payload attached to the request
interface AuthenticatedUser {
  id: number;
  role: string;
}

// Extend the Express Request interface to include the 'user' property
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error(
    'FATAL ERROR: JWT_SECRET is not defined in environment variables.'
  );
  process.exit(1); // Exit if the secret is not set
}

/**
 * Middleware to authenticate requests using JWT.
 * Verifies the token from the Authorization header and attaches user info to req.user.
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    // No token provided
    res
      .status(401)
      .json({ error: 'Unauthorized', message: 'Access token is required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload &
      AuthenticatedUser;

    // Check if the decoded token has the required user properties
    if (
      !decoded ||
      typeof decoded.id !== 'number' ||
      typeof decoded.role !== 'string'
    ) {
      throw new Error('Invalid token payload');
    }

    // Attach user information to the request object
    req.user = { id: decoded.id, role: decoded.role };
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    // Token verification failed (invalid signature, expired, etc.)
    console.error('JWT Verification Error:', error);
    res
      .status(401)
      .json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};

/**
 * Middleware factory to authorize requests based on user roles.
 * Must be used *after* authenticateToken middleware.
 * @param allowedRoles - An array of roles allowed to access the route.
 */
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      // This should ideally not happen if authenticateToken runs first
      res
        .status(401)
        .json({ error: 'Unauthorized', message: 'Authentication required' });
      return;
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      // User role is not permitted
      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
      });
      return;
    }

    next(); // User role is allowed, proceed
  };
};
