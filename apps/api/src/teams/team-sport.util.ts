import { BadRequestException } from '@nestjs/common';
import { TeamSport } from '@prisma/client';

const TEAM_SPORT_ERROR_MESSAGE =
  'sport must be one of SOCCER, BASKETBALL, BASEBALL (aliases: FOOTBALL/축구/soccer, 농구, 야구)';

const SPORT_ALIAS_MAP: Record<string, TeamSport> = {
  SOCCER: TeamSport.SOCCER,
  FOOTBALL: TeamSport.SOCCER,
  '축구': TeamSport.SOCCER,
  BASKETBALL: TeamSport.BASKETBALL,
  '농구': TeamSport.BASKETBALL,
  BASEBALL: TeamSport.BASEBALL,
  '야구': TeamSport.BASEBALL,
};

function normalizeSportKey(input: string) {
  return input.trim().toUpperCase().replace(/[\s_-]+/g, '');
}

export function normalizeTeamSport(input: unknown): TeamSport | null {
  if (typeof input !== 'string') return null;
  const raw = input.trim();
  if (!raw) return null;

  const compact = normalizeSportKey(raw);
  return SPORT_ALIAS_MAP[compact] ?? null;
}

export function normalizeTeamSportOrThrow(
  input: unknown,
  fieldPath = 'sport',
): TeamSport {
  const normalized = normalizeTeamSport(input);
  if (!normalized) {
    throw new BadRequestException(`${fieldPath}: ${TEAM_SPORT_ERROR_MESSAGE}`);
  }
  return normalized;
}

export function normalizeOptionalTeamSportOrThrow(
  input: unknown,
  fieldPath = 'sport',
): TeamSport | undefined {
  if (input === undefined || input === null) return undefined;
  if (typeof input === 'string' && input.trim() === '') return undefined;
  return normalizeTeamSportOrThrow(input, fieldPath);
}
