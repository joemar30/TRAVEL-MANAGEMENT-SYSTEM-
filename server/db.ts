import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Seed initial users on startup
export async function initDB() {
  console.log("Initializing database with Prisma...");
  
  // Ensure the admin user exists and has the correct role
  await prisma.user.upsert({
    where: { email: 'admin@travel.com' },
    update: {
      role: 'admin',
      password: '$2b$10$1Ma8RxsR8JHW2Z9lVmP/cO1pk02zPoIwRyrUZdz/4LPZImsPTtb/q', // password is 'admin'
    },
    create: {
      id: 'admin-01',
      full_name: 'TRAVEL Administrator',
      email: 'admin@travel.com',
      password: '$2b$10$1Ma8RxsR8JHW2Z9lVmP/cO1pk02zPoIwRyrUZdz/4LPZImsPTtb/q', // password is 'admin'
      role: 'admin'
    }
  });
  console.log("Admin user synchronized.");
}
