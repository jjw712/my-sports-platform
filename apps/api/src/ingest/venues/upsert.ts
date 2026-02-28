import type { Prisma, PrismaClient } from '@prisma/client';
import type { NormalizedVenueInput } from './normalize';

export type UpsertSummary = {
  inserted: number;
  updated: number;
  skipped: number;
};

export async function upsertVenues(
  prisma: PrismaClient,
  venues: NormalizedVenueInput[],
): Promise<UpsertSummary> {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const venue of venues) {
    const where = buildWhere(venue);
    const existing = await prisma.venue.findUnique({ where });

    if (!existing) {
      await prisma.venue.create({ data: venue });
      inserted += 1;
      continue;
    }

    const update = buildUpdateData(existing, venue);
    if (Object.keys(update).length === 0) {
      skipped += 1;
      continue;
    }

    await prisma.venue.update({ where, data: update });
    updated += 1;
  }

  return { inserted, updated, skipped };
}

function buildWhere(venue: NormalizedVenueInput) {
  if (venue.sourceId) {
    return {
      source_sourceId: {
        source: venue.source,
        sourceId: venue.sourceId,
      },
    } satisfies Prisma.VenueWhereUniqueInput;
  }

  return { uniqueKey: venue.uniqueKey } satisfies Prisma.VenueWhereUniqueInput;
}

function buildUpdateData(
  existing: {
    name: string;
    sido: string;
    sigungu: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
    sports: string[];
    facilityType: string | null;
    sourceId: string | null;
  },
  incoming: NormalizedVenueInput,
): Prisma.VenueUpdateInput {
  const update: Prisma.VenueUpdateInput = {};

  if (shouldUpdateString(existing.name, incoming.name)) {
    update.name = incoming.name;
  }
  if (shouldUpdateString(existing.sido, incoming.sido)) {
    update.sido = incoming.sido;
  }
  if (shouldUpdateOptionalString(existing.sigungu, incoming.sigungu)) {
    update.sigungu = incoming.sigungu;
  }
  if (shouldUpdateOptionalString(existing.address, incoming.address)) {
    update.address = incoming.address;
  }
  if (shouldUpdateNumber(existing.lat, incoming.lat)) {
    update.lat = incoming.lat;
  }
  if (shouldUpdateNumber(existing.lng, incoming.lng)) {
    update.lng = incoming.lng;
  }
  if (incoming.sports.length > 0 && !arraysEqual(existing.sports, incoming.sports)) {
    update.sports = incoming.sports;
  }
  if (shouldUpdateOptionalString(existing.facilityType, incoming.facilityType)) {
    update.facilityType = incoming.facilityType;
  }
  if (shouldUpdateOptionalString(existing.sourceId, incoming.sourceId)) {
    update.sourceId = incoming.sourceId;
  }

  return update;
}

function shouldUpdateString(existing: string, incoming?: string): boolean {
  if (!incoming || incoming.trim().length === 0) return false;
  return existing !== incoming;
}

function shouldUpdateOptionalString(
  existing: string | null,
  incoming?: string,
): boolean {
  if (!incoming || incoming.trim().length === 0) return false;
  return existing !== incoming;
}

function shouldUpdateNumber(existing: number | null, incoming?: number): boolean {
  if (incoming === null || incoming === undefined || Number.isNaN(incoming)) {
    return false;
  }
  return existing !== incoming;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}
