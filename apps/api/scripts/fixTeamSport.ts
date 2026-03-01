import 'dotenv/config';
import { PrismaClient, TeamSport } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

type TeamRow = {
  id: number;
  sport: string | null;
};

type SportCountRow = {
  sport: string | null;
  count: bigint | number;
};

function normalizeTeamSport(input: string | null): {
  value: TeamSport;
  unknown: boolean;
} {
  const raw = (input ?? '').trim();
  const upper = raw.toUpperCase();

  if (upper === TeamSport.SOCCER) return { value: TeamSport.SOCCER, unknown: false };
  if (upper === TeamSport.BASKETBALL) return { value: TeamSport.BASKETBALL, unknown: false };
  if (upper === TeamSport.BASEBALL) return { value: TeamSport.BASEBALL, unknown: false };

  const compact = upper.replace(/[\s_-]+/g, '');
  if (compact === 'SOCCER' || compact === 'FOOTBALL') {
    return { value: TeamSport.SOCCER, unknown: false };
  }
  if (compact === 'BASKETBALL') {
    return { value: TeamSport.BASKETBALL, unknown: false };
  }
  if (compact === 'BASEBALL') {
    return { value: TeamSport.BASEBALL, unknown: false };
  }

  return { value: TeamSport.SOCCER, unknown: true };
}

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
    const unknownIds: number[] = [];

    for (const team of teams) {
      const normalized = normalizeTeamSport(team.sport);
      if (normalized.unknown) unknownIds.push(team.id);

      if ((team.sport ?? '').trim().toUpperCase() === normalized.value) {
        continue;
      }

      await prisma.team.update({
        where: { id: team.id },
        data: { sport: normalized.value },
      });
      changed += 1;
    }

    console.log(`[fix:team-sport] updated rows: ${changed}`);
    if (unknownIds.length > 0) {
      console.log(
        `[fix:team-sport] unknown values defaulted to SOCCER for team ids: ${unknownIds.join(', ')}`,
      );
    }

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
