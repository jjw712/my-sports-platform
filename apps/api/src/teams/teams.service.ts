import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TeamSport } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { normalizeTeamSportOrThrow } from './team-sport.util';

function isUniqueConstraintError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  return 'code' in error && (error as { code?: string }).code === 'P2002';
}

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamDto) {
    const normalizedSport = normalizeTeamSportOrThrow(dto.sport, 'sport');

    try {
      const created = await this.prisma.client.team.create({
        data: {
          name: dto.name.trim(),
          sport: normalizedSport,
          region: dto.region?.trim() || null,
          logoUrl: dto.logoUrl?.trim() || null,
          description: dto.description?.trim() || null,
          skillRating: dto.skillRating ?? 0,
        },
      });
      return {
        ...created,
        sport: normalizeTeamSportOrThrow(created.sport, 'team.sport'),
      };
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('team name already exists');
      }
      throw error;
    }
  }

  async list(input?: {
    sport?: TeamSport;
    take?: number;
    cursor?: number;
  }) {
    const teams = await this.prisma.client.team.findMany({
      ...(input?.take ? { take: input.take } : {}),
      ...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      where: {
        ...(input?.sport ? { sport: input.sport } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return teams.map((team, index) => ({
      ...team,
      sport: normalizeTeamSportOrThrow(team.sport, `teams[${index}].sport`),
    }));
  }

  async findOne(id: number) {
    const team = await this.prisma.client.team.findUnique({
      where: { id },
    });
    if (!team) {
      throw new NotFoundException('team not found');
    }
    return {
      ...team,
      sport: normalizeTeamSportOrThrow(team.sport, 'team.sport'),
    };
  }
}
