import 'dotenv/config';
import { createPrismaClient } from '../src/ingest/prisma';
import { kakaoGeocode } from '../src/lib/kakaoGeocode';

const DEFAULT_LIMIT = 500;
const DEFAULT_DELAY_MS = 120;

async function main() {
  const args = process.argv.slice(2);
  const limit = parseNumberArg(args, '--limit') ?? DEFAULT_LIMIT;
  const delayMs = parseNumberArg(args, '--delay') ?? DEFAULT_DELAY_MS;

  const prisma = createPrismaClient();
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const venues = await prisma.venue.findMany({
      where: {
        address: { not: null },
        OR: [{ lat: null }, { lng: null }],
      },
      take: limit,
      orderBy: { updatedAt: 'asc' },
    });

    console.log(`Backfill 대상: ${venues.length}`);

    for (const venue of venues) {
      const address = venue.address?.trim();
      if (!address) {
        skipped += 1;
        continue;
      }

      const geocoded = await kakaoGeocode(address);
      if (!geocoded) {
        failed += 1;
        console.log(`No geocode result: ${venue.id} ${address}`);
        await sleep(delayMs);
        continue;
      }

      await prisma.venue.update({
        where: { id: venue.id },
        data: { lat: geocoded.lat, lng: geocoded.lng },
      });
      updated += 1;

      await sleep(delayMs);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
}

function parseNumberArg(args: string[], flag: string): number | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  const value = Number(args[index + 1]);
  if (Number.isNaN(value) || value <= 0) return undefined;
  return value;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error('Backfill failed:', error);
  process.exitCode = 1;
});
