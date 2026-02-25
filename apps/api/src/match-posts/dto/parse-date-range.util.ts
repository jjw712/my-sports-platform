import { BadRequestException } from '@nestjs/common';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function parseIsoDate(value: string, field: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException(`${field} must be a valid ISO date string`);
  }
  return d;
}

function parseKstDayRange(value: string): { rangeStart: Date; rangeEnd: Date } {
  const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/.exec(value.trim());

  if (dateOnlyMatch) {
    const [y, m, d] = value.split('-').map((v) => Number(v));
    const startUtc = Date.UTC(y, m - 1, d, 0, 0, 0) - KST_OFFSET_MS;
    const rangeStart = new Date(startUtc);
    return { rangeStart, rangeEnd: new Date(startUtc + DAY_MS) };
  }

  const parsed = parseIsoDate(value, 'date');
  const kst = new Date(parsed.getTime() + KST_OFFSET_MS);
  const y = kst.getUTCFullYear();
  const m = kst.getUTCMonth();
  const d = kst.getUTCDate();
  const startUtc = Date.UTC(y, m, d, 0, 0, 0) - KST_OFFSET_MS;
  const rangeStart = new Date(startUtc);
  return { rangeStart, rangeEnd: new Date(startUtc + DAY_MS) };
}

export function parseDateRange(input: {
  dateFrom?: string;
  dateTo?: string;
  date?: string;
}): { rangeStart?: Date; rangeEnd?: Date } {
  if (input.date) {
    return parseKstDayRange(input.date);
  }

  const rangeStart = input.dateFrom
    ? parseIsoDate(input.dateFrom, 'dateFrom')
    : undefined;
  const rangeEnd = input.dateTo
    ? parseIsoDate(input.dateTo, 'dateTo')
    : undefined;

  return { rangeStart, rangeEnd };
}
