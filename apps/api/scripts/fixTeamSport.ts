import 'dotenv/config';
import { PrismaClient, TeamSport } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { normalizeTeamSport } from '../src/teams/team-sport.util';

type TeamRow = {
  id: number;
  sport: string | null;
};

type SportCountRow = {
  sport: string | null;
  count: bigint | number;
};

async function printAudit(prisma: PrismaClient, title: string) {
  const rows = await prisma.$queryRaw<SportCountRow[]>`
    SELECT "sport"::text AS sport, COUNT(*)::bigint AS count
    FROM "Team"
    GROUP BY 1
    ORDER BY 2 DESC, 1 ASC
  `;

  console.log(title);
  if (rows.length === 0) {
    console.log('- (no rows)');
    return;
  }

  for (const row of rows) {
    const count = typeof row.count === 'bigint' ? Number(row.count) : row.count;
    console.log(`- ${row.sport ?? '(null)'}: ${count}`);
  }
}

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
    await printAudit(prisma, '[fix:team-sport] before');

    const teams = await prisma.$queryRaw<TeamRow[]>`
      SELECT "id", "sport"::text AS sport
      FROM "Team"
      ORDER BY "id" ASC
    `;

    let changed = 0;
    const unknownRows: Array<{ id: number; sport: string | null }> = [];

    for (const team of teams) {
      const normalized = normalizeTeamSport(team.sport);
      if (!normalized) {
        unknownRows.push({ id: team.id, sport: team.sport });
        continue;
      }

      if ((team.sport ?? '').trim().toUpperCase() === normalized) {
        continue;
      }

      await prisma.team.update({
        where: { id: team.id },
        data: { sport: normalized as TeamSport },
      });
      changed += 1;
    }

    if (unknownRows.length > 0) {
      const details = unknownRows
        .map((row) => `id=${row.id}, sport=${row.sport ?? '(null)'}`)
        .join(' | ');
      throw new Error(`[fix:team-sport] unknown sport values found: ${details}`);
    }

    console.log(`[fix:team-sport] updated rows: ${changed}`);

    await printAudit(prisma, '[fix:team-sport] after');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[fix:team-sport] failed');
  console.error(err);
  process.exit(1);
});
