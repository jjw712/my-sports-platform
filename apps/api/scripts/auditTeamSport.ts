import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

type SportCountRow = {
  sport: string | null;
  count: bigint | number;
};

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error('DATABASE_URL is missing');
  }
  const pool = new Pool({
    connectionString: url,
    max: 1,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    const rows = await prisma.$queryRaw<SportCountRow[]>`
      SELECT "sport"::text AS sport, COUNT(*)::bigint AS count
      FROM "Team"
      GROUP BY 1
      ORDER BY 2 DESC, 1 ASC
    `;

    console.log('[audit:team-sport] distinct values');
    if (rows.length === 0) {
      console.log('- (no rows)');
      return;
    }

    for (const row of rows) {
      const count = typeof row.count === 'bigint' ? Number(row.count) : row.count;
      console.log(`- ${row.sport ?? '(null)'}: ${count}`);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[audit:team-sport] failed');
  console.error(err);
  process.exit(1);
});
