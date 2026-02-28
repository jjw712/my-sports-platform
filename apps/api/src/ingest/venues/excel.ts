import fs from 'node:fs';
import path from 'node:path';
import xlsx from 'xlsx';

export type RawVenueRow = {
  name?: string;
  sido?: string;
  sigungu?: string;
  address?: string;
  lat?: number;
  lng?: number;
  sourceId?: string;
  facilityType?: string;
};

const HEADER_SCAN_LIMIT = 20;

const SOCCER_SHEET_REGEX = /축구/;
const SOCCER_SHEET_EXCLUDE_REGEX = /(요약|총괄|현황|통계|집계|합계|소계|전국|표지|목차|summary)/i;

const HEADER_KEYWORDS = {
  name: ['시설명', '체육시설명'],
  sido: ['시도', '시·도', '시/도', '시도명'],
  sigungu: ['시군구', '군구', '구군', '시군', '자치구'],
  address: ['소재지', '주소', '소재지(지번)', '도로명주소'],
  roadAddress: ['도로명'],
  jibunAddress: ['지번'],
  lat: ['위도'],
  lng: ['경도'],
  sourceId: ['관리번호', '시설번호', '연번', '일련번호', 'ID'],
};

export function loadSoccerRowsFromEnv(): RawVenueRow[] {
  const envPath = process.env.PUBLIC_FACILITIES_XLSX?.trim();
  if (!envPath) {
    throw new Error('PUBLIC_FACILITIES_XLSX is missing. Check apps/api/.env');
  }
  const filePath = path.resolve(process.cwd(), envPath);
  return loadSoccerRows(filePath);
}

export function loadSoccerRows(filePath: string): RawVenueRow[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found at ${filePath}`);
  }

  const workbook = xlsx.readFile(filePath, { cellDates: false, cellText: true });
  const sheetNames = workbook.SheetNames.filter(isSoccerDataSheet);

  const rows: RawVenueRow[] = [];
  let rowsWithSido = 0;
  let rowsWithFilledSido = 0;
  for (const sheetName of sheetNames) {
    let lastSido: string | undefined;
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const sheetRows = xlsx.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
      blankrows: false,
    }) as Array<Array<string | number | boolean | null>>;

    const headerIndex = findHeaderRowIndex(sheetRows);
    if (headerIndex === null) continue;

    const headers = buildHeaders(sheetRows[headerIndex] ?? []);
    const columnMap = detectColumns(headers);

    for (let i = headerIndex + 1; i < sheetRows.length; i += 1) {
      const row = sheetRows[i] ?? [];
      if (isEmptyRow(row)) continue;

      const rowObject = toRowObject(headers, row);
      const currentSidoRaw = pickValue(rowObject, columnMap.sido);
      const currentSido = currentSidoRaw ? normalizeSido(currentSidoRaw) : undefined;
      if (currentSido) {
        lastSido = currentSido;
        rowsWithSido += 1;
      }

      const filledSido = currentSido || lastSido;
      if (filledSido) rowsWithFilledSido += 1;

      const name = pickValue(rowObject, columnMap.name);
      const sigungu = pickValue(rowObject, columnMap.sigungu);
      if (isSummaryRow(name, filledSido, sigungu)) continue;

      const rawRow: RawVenueRow = {
        name: name ?? undefined,
        sido: filledSido ?? undefined,
        sigungu: sigungu ?? undefined,
        address: pickAddress(rowObject, columnMap) ?? undefined,
        lat: toNumber(pickValue(rowObject, columnMap.lat)),
        lng: toNumber(pickValue(rowObject, columnMap.lng)),
        sourceId: pickValue(rowObject, columnMap.sourceId) ?? undefined,
        facilityType: 'SOCCER_FIELD',
      };

      rows.push(rawRow);
    }
  }

  console.log(`Rows with sido present: ${rowsWithSido}`);
  console.log(`Rows with sido filled: ${rowsWithFilledSido}`);

  return rows;
}

function isSoccerDataSheet(name: string): boolean {
  if (!SOCCER_SHEET_REGEX.test(name)) return false;
  return !SOCCER_SHEET_EXCLUDE_REGEX.test(name);
}

function findHeaderRowIndex(rows: Array<Array<string | number | boolean | null>>):
  | number
  | null {
  const limit = Math.min(rows.length, HEADER_SCAN_LIMIT);
  for (let i = 0; i < limit; i += 1) {
    const row = rows[i] ?? [];
    const normalized = row.map((cell) => normalizeCell(cell));
    const hasName = normalized.some((cell) => includesAny(cell, HEADER_KEYWORDS.name));
    const hasSido = normalized.some((cell) => includesAny(cell, HEADER_KEYWORDS.sido));
    const hasAddress = normalized.some((cell) => includesAny(cell, HEADER_KEYWORDS.address));
    if (hasName && (hasSido || hasAddress)) {
      return i;
    }
  }
  return null;
}

function buildHeaders(row: Array<string | number | boolean | null>): string[] {
  const headers: string[] = [];
  for (let i = 0; i < row.length; i += 1) {
    const normalized = normalizeCell(row[i]);
    headers.push(normalized.length > 0 ? normalized : `__EMPTY_${i}`);
  }
  return headers;
}

function detectColumns(headers: string[]) {
  const name = findHeader(headers, HEADER_KEYWORDS.name);
  const sido = findHeader(headers, HEADER_KEYWORDS.sido);
  const sigungu = findHeader(headers, HEADER_KEYWORDS.sigungu);
  const address = findHeader(headers, HEADER_KEYWORDS.address);
  const roadAddress = findHeader(headers, HEADER_KEYWORDS.roadAddress);
  const jibunAddress = findHeader(headers, HEADER_KEYWORDS.jibunAddress);
  const lat = findHeader(headers, HEADER_KEYWORDS.lat);
  const lng = findHeader(headers, HEADER_KEYWORDS.lng);
  const sourceId = findHeader(headers, HEADER_KEYWORDS.sourceId);

  return {
    name,
    sido,
    sigungu,
    address,
    roadAddress,
    jibunAddress,
    lat,
    lng,
    sourceId,
  };
}

function findHeader(headers: string[], keywords: string[]): string | undefined {
  for (const header of headers) {
    const normalized = normalizeHeaderKey(header);
    if (keywords.some((keyword) => normalized.includes(normalizeHeaderKey(keyword)))) {
      return header;
    }
  }
  return undefined;
}

function toRowObject(headers: string[], row: Array<string | number | boolean | null>) {
  const record: Record<string, string> = {};
  for (let i = 0; i < headers.length; i += 1) {
    record[headers[i]] = normalizeCell(row[i]);
  }
  return record;
}

function normalizeCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function pickValue(record: Record<string, string>, key?: string): string | undefined {
  if (!key) return undefined;
  const value = record[key];
  if (!value) return undefined;
  return value.trim();
}

function pickAddress(
  record: Record<string, string>,
  columns: { address?: string; roadAddress?: string; jibunAddress?: string },
): string | undefined {
  const road = pickValue(record, columns.roadAddress);
  if (road) return road;
  const jibun = pickValue(record, columns.jibunAddress);
  if (jibun) return jibun;
  return pickValue(record, columns.address);
}

function toNumber(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
}

function isEmptyRow(row: Array<string | number | boolean | null>): boolean {
  return row.every((cell) => normalizeCell(cell).length === 0);
}

function isSummaryRow(
  name?: string,
  sido?: string,
  sigungu?: string,
): boolean {
  if (!name || name.trim().length === 0) return true;
  if (name === '전국') return true;

  const sigunguValue = sigungu ?? '';
  const hasSummaryMarker =
    name.includes('소계') ||
    name.includes('합계') ||
    name.includes('계') ||
    sigunguValue.includes('소계') ||
    sigunguValue.includes('합계') ||
    sigunguValue.includes('계');
  if (hasSummaryMarker) return true;

  if (isNumericString(name)) return true;

  return false;
}

function includesAny(value: string, keywords: string[]): boolean {
  const normalized = normalizeHeaderKey(value);
  return keywords.some((keyword) => normalized.includes(normalizeHeaderKey(keyword)));
}

function isNumericString(value: string): boolean {
  return /^\d+(?:\.\d+)?$/.test(value.replace(/,/g, ''));
}

function normalizeSido(value: string): string {
  const trimmed = value.trim();
  if (trimmed.includes('서울')) return '서울';
  if (trimmed.includes('경기')) return '경기';
  if (trimmed.includes('인천')) return '인천';
  return trimmed;
}

function normalizeHeaderKey(value: string): string {
  return value.replace(/\s+/g, '').replace(/[·./]/g, '').trim();
}
