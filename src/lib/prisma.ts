import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma Client instance.
// This is done to prevent creating new instances on every hot reload in development.
declare global {
  var prisma: PrismaClient | undefined;
}

// Instantiate the Prisma Client. If a global instance already exists, use it.
// Otherwise, create a new one.
const prisma = global.prisma || new PrismaClient();

// In development, assign the new instance to the global variable.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;