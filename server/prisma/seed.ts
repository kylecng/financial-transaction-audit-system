import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// =============================================================================
// WARNING: DEVELOPMENT ONLY SEED SCRIPT
// =============================================================================
// This script is intended ONLY for development environments.
// It creates default users with INSECURE, hardcoded passwords.
// DO NOT run this script in staging or production environments.
// Production user creation should be handled via a secure, separate process.
// =============================================================================

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const saltRounds = 10; // Standard practice for bcrypt salt rounds

  // --- Create Auditor User ---
  const auditorUsername = 'audit_user';
  const auditorPassword = 'password123'; // Use a more secure password in production!
  const auditorPasswordHash = await bcrypt.hash(auditorPassword, saltRounds);

  const auditor = await prisma.user.upsert({
    where: { username: auditorUsername },
    update: {}, // No updates needed if user exists
    create: {
      username: auditorUsername,
      passwordHash: auditorPasswordHash,
      role: 'auditor',
    },
  });
  console.log(`Created/found auditor user: ${auditor.username}`);

  // --- Create Transactor User ---
  const transactorUsername = 'transact_user';
  const transactorPassword = 'password456'; // Use a more secure password in production!
  const transactorPasswordHash = await bcrypt.hash(
    transactorPassword,
    saltRounds
  );

  const transactor = await prisma.user.upsert({
    where: { username: transactorUsername },
    update: {}, // No updates needed if user exists
    create: {
      username: transactorUsername,
      passwordHash: transactorPasswordHash,
      role: 'transactor',
    },
  });
  console.log(`Created/found transactor user: ${transactor.username}`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
