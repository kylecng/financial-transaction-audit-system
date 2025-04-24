import prisma from '../utils/prisma';
import { comparePassword } from '../utils/authUtils';
import { User as PrismaUser } from '@prisma/client'; // Import full Prisma User type
import { User } from '../types'; // Import the simplified User type for return

/**
 * Authenticates a user based on username and password.
 * @param username - The user's username.
 * @param password - The user's plaintext password.
 * @returns The authenticated User object (without password hash) if successful, otherwise null.
 */
export const authenticateUser = async (
  username: string,
  password?: string // Make password optional initially for flexibility, but require it for auth logic
): Promise<User | null> => {
  if (!password) {
    // Password is required for authentication
    return null;
  }

  // Find the user by username
  const userRecord: PrismaUser | null = await prisma.user.findUnique({
    where: { username },
  });

  if (!userRecord) {
    // User not found
    return null;
  }

  // Compare the provided password with the stored hash
  const isPasswordValid = await comparePassword(
    password,
    userRecord.passwordHash
  );

  if (!isPasswordValid) {
    // Invalid password
    return null;
  }

  // Authentication successful, return user data (excluding password hash)
  // Ensure the role is correctly cast to the defined literal type
  const userRole = userRecord.role as User['role']; // Cast role

  const authenticatedUser: User = {
    id: userRecord.id,
    username: userRecord.username,
    role: userRole,
  };

  return authenticatedUser;
};
