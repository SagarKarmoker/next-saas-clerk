const { PrismaClient } = require("@prisma/client");

// Singleton pattern
const prismaClient = () => {
    return new PrismaClient();
}

// Checking for an existing connection
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || prismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;