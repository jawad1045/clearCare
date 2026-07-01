import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

function createPrismaClient() {
  if (!globalForPrisma.pool) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL!,
      max: 1,
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 15_000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 5_000,
    });
    // Remove dead clients from the pool instead of queuing against them
    pool.on("error", (err, _client) => {
      console.error("pg pool error, removing client:", err.message);
    });
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(globalForPrisma.pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
