import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken'; // Import Secret and SignOptions types
import { User } from '../types'; // Corrected import path

// Load JWT secret from environment variables, provide a default for development
// IMPORTANT: Set a strong, unique JWT_SECRET in your .env file for production!
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-dev-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // Token expiration time

/**
 * Compares a plaintext password with a stored hash.
 * @param plaintextPassword - The password provided by the user.
 * @param hash - The stored password hash from the database.
 * @returns True if the password matches the hash, false otherwise.
 */
export const comparePassword = async (
  plaintextPassword: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(plaintextPassword, hash);
};

/**
 * Generates a JSON Web Token (JWT) for an authenticated user.
 * @param user - The user object containing id and role.
 * @returns The generated JWT string.
 */
export const generateToken = (user: Pick<User, 'id' | 'role'>): string => {
  const payload = {
    userId: user.id,
    role: user.role,
  };

  // Convert expiresIn to seconds (simple conversion for '1h')
  // TODO: Add more robust parsing if other formats are needed for JWT_EXPIRES_IN
  const expiresInSeconds =
    JWT_EXPIRES_IN === '1h' ? 3600 : parseInt(JWT_EXPIRES_IN, 10);

  // Explicitly define SignOptions, removing algorithm
  const signOptions: SignOptions = {
    expiresIn: expiresInSeconds, // Use seconds
  };

  // Pass JWT_SECRET directly, Secret type is imported
  return jwt.sign(payload, JWT_SECRET, signOptions);
};

/**
 * Verifies a JWT and extracts the payload.
 * @param token - The JWT string to verify.
 * @returns The decoded payload if the token is valid, otherwise null.
 */
export const verifyToken = (
  token: string
): { userId: number; role: string } | null => {
  try {
    // Explicitly type the decoded payload
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      role: string;
      iat: number;
      exp: number;
    };
    return { userId: decoded.userId, role: decoded.role };
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
};
