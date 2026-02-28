import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export function createPrismaClient(): PrismaClient {
  const url =
    process.env.DATABASE_URL?.trim() ||
    process.env.DIRECT_URL?.trim() ||
    process.env.PRISMA_DATABASE_URL?.trim();

  if (!url) {
    throw new Error(
      'Database URL is missing. Set DATABASE_URL, DIRECT_URL, or PRISMA_DATABASE_URL.',
    );
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}
