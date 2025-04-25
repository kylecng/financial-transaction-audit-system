import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma namespace
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

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

  // --- Create Transactor User 1 ---
  const transactorUsername1 = 'transact_user_1';
  const transactorPassword1 = 'password456'; // Use a more secure password in production!
  const transactorPasswordHash1 = await bcrypt.hash(
    transactorPassword1,
    saltRounds
  );

  const transactor1 = await prisma.user.upsert({
    where: { username: transactorUsername1 },
    update: {}, // No updates needed if user exists
    create: {
      username: transactorUsername1,
      passwordHash: transactorPasswordHash1,
      role: 'transactor',
    },
  });
  console.log(`Created/found transactor user 1: ${transactor1.username}`);

  // --- Create Transactor User 2 ---
  const transactorUsername2 = 'transact_user_2';
  const transactorPassword2 = 'password789'; // Use a more secure password in production!
  const transactorPasswordHash2 = await bcrypt.hash(
    transactorPassword2,
    saltRounds
  );

  const transactor2 = await prisma.user.upsert({
    where: { username: transactorUsername2 },
    update: {}, // No updates needed if user exists
    create: {
      username: transactorUsername2,
      passwordHash: transactorPasswordHash2,
      role: 'transactor',
    },
  });
  console.log(`Created/found transactor user 2: ${transactor2.username}`);

  // Store transactor IDs for random assignment
  const transactorIds = [transactor1.id, transactor2.id];

  // --- Generate Random Transactions (linked randomly to one of the transactors) ---
  console.log(
    `Generating random transactions for users: ${transactor1.username}, ${transactor2.username}`
  );
  // Explicitly type the array here
  const generatedTransactions: Prisma.TransactionUncheckedCreateInput[] = [];
  const transactionTypes = ['Debit', 'Credit', 'Transfer'];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
  const sourceSystems = [
    'WebPortal',
    'MobileApp',
    'BatchProcess',
    'API-Integration',
    'ManualEntry',
  ];

  console.log(`Generating 100 random transactions...`);
  for (let i = 0; i < 100; i++) {
    // The object structure should conform to Prisma.TransactionUncheckedCreateInput
    // Note: If 'sourceSystem' is optional in your schema, this structure is fine.
    // If it's required, ensure faker always provides a value or handle null appropriately.
    generatedTransactions.push({
      transactionType: faker.helpers.arrayElement(transactionTypes),
      amount: parseFloat(faker.finance.amount()),
      currency: faker.helpers.arrayElement(currencies),
      accountId: `ACC-${faker.string.alphanumeric(7).toUpperCase()}`,
      transactionTimestamp: faker.date.recent({ days: 90 }),
      description: faker.finance.transactionDescription(),
      sourceSystem: faker.helpers.arrayElement(sourceSystems),
      createdById: faker.helpers.arrayElement(transactorIds), // Randomly assign
    });
  }

  // Combine transactions - ensure types are compatible
  // Using Prisma.TransactionUncheckedCreateInput for both arrays ensures compatibility
  const allTransactionsToCreate = [
    ...generatedTransactions, // Only include generated transactions
  ];

  console.log(
    `Attempting to create ${allTransactionsToCreate.length} generated transactions.` // Updated log message
  );

  // Use createMany with the correctly typed data
  const createdTransactions = await prisma.transaction.createMany({
    data: allTransactionsToCreate,
    skipDuplicates: true,
  });

  console.log(`Created ${createdTransactions.count} new transactions.`); // This count reflects only newly added ones if skipDuplicates is true

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
