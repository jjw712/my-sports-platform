import type { RawVenueRow } from './excel';

export type NormalizedVenueInput = {
  name: string;
  sido: string;
  sigungu?: string;
  address?: string;
  lat?: number;
  lng?: number;
  sports: string[];
  facilityType?: string;
  source: string;
  sourceId?: string;
  uniqueKey: string;
};

export function normalizeName(name: string): string {
  return collapseSpaces(name);
}

export function normalizeAddress(address: string): string {
  return collapseSpaces(address);
}

/** Map variants like "서울특별시" -> "서울", "경기도" -> "경기", "인천광역시" -> "인천" */
export function normalizeSido(raw: string): string {
  const v = collapseSpaces(raw);

  // Common metro mappings
  if (v.includes('서울')) return '서울';
  if (v.includes('경기')) return '경기';
  if (v.includes('인천')) return '인천';

  // Optional: keep as-is for now (future expansion)
  // e.g. "부산광역시" -> "부산"
  // If you want, you can add more mappings here.
  return v;
}

/** Optional: clean up sigungu variants */
export function normalizeSigungu(raw?: string): string | undefined {
  const v = raw ? collapseSpaces(raw) : '';
  return v || undefined;
}

export function makeUniqueKey(
  sido: string,
  sigungu: string | undefined,
  name: string,
  address: string | undefined,
): string {
  const normalizedName = normalizeName(name);
  const normalizedAddress = address ? normalizeAddress(address) : '';
  return `${sido}|${sigungu ?? ''}|${normalizedName}|${normalizedAddress}`;
}

export function normalizeRow(
  raw: RawVenueRow,
  source: string,
): NormalizedVenueInput | null {
  const name = raw.name?.trim();
  const rawSido = raw.sido?.trim();
  if (!name || !rawSido) return null;

  const sido = normalizeSido(rawSido);
  const sigungu = normalizeSigungu(raw.sigungu);
  const address = raw.address ? normalizeAddress(raw.address) : undefined;
  const normalizedName = normalizeName(name);

  return {
    name: normalizedName,
    sido,
    sigungu,
    address,
    lat: raw.lat,
    lng: raw.lng,
    sports: ['SOCCER'],
    facilityType: 'SOCCER_FIELD',
    source,
    sourceId: raw.sourceId?.trim() || undefined,
    uniqueKey: makeUniqueKey(sido, sigungu, normalizedName, address),
  };
}

function collapseSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}