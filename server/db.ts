import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Seed initial users on startup
export async function initDB() {
  console.log("Initializing database with Prisma...");
  
  // Seed the admin user if not exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@tms.com' }
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        id: 'admin-01',
        full_name: 'TMS Administrator',
        email: 'admin@tms.com',
        password: '$2b$10$s7rNylmusHMT1qVuYfSmH.ZEO2T6a0Qf7lPfVoe6N9Z2QAKotY4cq',
        role: 'admin'
      }
    });
    console.log("Admin seeded.");
  }
}
