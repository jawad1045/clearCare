import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter=new PrismaPg({
    connectionString:process.env.DATABASE_URL,
})
// If you are hardcoding your database connection string, pass it inside the object below:
const prisma = new PrismaClient({
    adapter,
});

async function main() {
  console.log('⏳ Preparing system initialization seed...');

  // 1. Clean up old records to avoid duplicate email errors during testing
  await prisma.user.deleteMany({});
  await prisma.company.deleteMany({});

  // 2. Create the initial Company profile required by your foreign keys
  const company = await prisma.company.create({
    data: {
      organization: 'Health & Wellness Provider Group',
      street: '789 Administration Way',
      city: 'Austin',
      state: 'Texas',
      zip: '78701',
      contactPhone: '512-555-0100',
      contactFirstName: 'System',
      contactLastName: 'Administrator',
      contactEmail: 'admin@hwp-system.com',
    },
  });
  console.log(`✅ Organization created: ${company.organization}`);

  // 3. Generate secure password hashes using bcrypt
  const saltRounds = 10;
  const adminHashedPassword = await bcrypt.hash('SuperAdminPassword123!', saltRounds);
  const userHashedPassword = await bcrypt.hash('StandardUserPassword123!', saltRounds);

  // 4. Record 1: The Global HWP Admin Account
  const adminAccount = await prisma.user.create({
    data: {
      acctId: company.id,
      organization: company.organization,
      contactFirstName: 'Chief',
      contactLastName: 'Admin',
      contactEmail: 'admin@hwp-system.com', // Used to log in as admin
      contactPhone: '512-555-0101',
      password: adminHashedPassword,       // Securely encrypted hash
      userRole: 'Admin',               // Strict role match from specs
      isActive: true,
    },
  });
  console.log(`👑 Record 1 Added: HWP Admin Account (${adminAccount.contactEmail})`);

  // 5. Record 2: The standard Company User Account
  const regularUserAccount = await prisma.user.create({
    data: {
      acctId: company.id,
      organization: company.organization,
      contactFirstName: 'Sarah',
      contactLastName: 'Coordinator',
      contactEmail: 'sarah.c@company.com', // Used to log in as regular user
      contactPhone: '512-555-0102',
      password: userHashedPassword,        // Securely encrypted hash
      userRole: 'User',            // Strict role match from specs
      isActive: true,
    },
  });
  console.log(`👤 Record 2 Added: Company User Account (${regularUserAccount.contactEmail})`);

  console.log('\n🎉 System records successfully provisioned! Ready to test login.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding process broken:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });