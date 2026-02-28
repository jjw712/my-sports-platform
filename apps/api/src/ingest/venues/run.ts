import 'dotenv/config';
import { loadSoccerRowsFromEnv } from './excel';
import { normalizeRow, normalizeSido } from './normalize';
import { upsertVenues } from './upsert';
import { createPrismaClient } from '../prisma';

const DEFAULT_SIDO = ['서울', '경기', '인천'];
const DEFAULT_SOURCE = 'MCST_2025_XLSX';



async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limit = parseNumberArg(args, '--limit');
  const sidoArg = getArgValue(args, '--sido');
  const sidoFilters = parseSidoFilters(sidoArg);

  const rawRows = loadSoccerRowsFromEnv();
  // DEBUG: see how many rows actually have sido filled
const hasSido = rawRows.filter(r => r.sido && r.sido.trim().length > 0).length;
console.log(`DEBUG rows with sido present: ${hasSido}/${rawRows.length}`);

// DEBUG: top raw sido values
const freq = new Map<string, number>();
for (const r of rawRows) {
  const v = (r.sido ?? '').trim();
  if (!v) continue;
  freq.set(v, (freq.get(v) ?? 0) + 1);
}
const top = [...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 20);
console.log("DEBUG top raw sido values:", top);

// DEBUG: print first 5 rows that have a name to inspect mapping
const sample = rawRows.filter(r => r.name).slice(0, 5);
console.log("DEBUG sample rows:", sample);
  // Normalize filter set too (so user can pass "서울특별시" and it still works)
  const normalizedSidoFilters = new Set(Array.from(sidoFilters).map(normalizeSido));

  const filteredRows = rawRows.filter((row) => {
  if (!row.sido) return false;
  const sido = normalizeSido(row.sido);
  return normalizedSidoFilters.has(sido);
});

  const normalizedRows = filteredRows
    .map((row) => normalizeRow(row, DEFAULT_SOURCE))
    .filter((row): row is NonNullable<typeof row> => Boolean(row));

  const limitedRows = limit ? normalizedRows.slice(0, limit) : normalizedRows;

  console.log('Venues ingestion summary');
  console.log(`Total parsed: ${rawRows.length}`);
  console.log(`Filtered (sido): ${filteredRows.length}`);
  console.log(`Normalized: ${normalizedRows.length}`);
  if (limit) {
    console.log(`Limited: ${limitedRows.length}`);
  }

  if (dryRun) {
    console.log('Dry-run enabled. No database writes performed.');
    return;
  }

  const prisma = createPrismaClient();
  try {
    const { inserted, updated, skipped } = await upsertVenues(prisma, limitedRows);
    console.log(`Inserted: ${inserted}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
  } finally {
    await prisma.$disconnect();
  }
}

function parseNumberArg(args: string[], flag: string): number | undefined {
  const value = getArgValue(args, flag);
  if (!value) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function getArgValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

function parseSidoFilters(value?: string): Set<string> {
  if (!value || value.trim().length === 0) {
    return new Set(DEFAULT_SIDO);
  }
  return new Set(
    value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
  );
}

main().catch((error) => {
  console.error('Ingestion failed:', error);
  process.exitCode = 1;
});
