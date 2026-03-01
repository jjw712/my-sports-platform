import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TeamSport } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';

function isUniqueConstraintError(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  return 'code' in error && (error as { code?: string }).code === 'P2002';
}

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTeamDto) {
    try {
      return await this.prisma.client.team.create({
        data: {
          name: dto.name.trim(),
          sport: dto.sport,
          region: dto.region?.trim() || null,
          logoUrl: dto.logoUrl?.trim() || null,
          description: dto.description?.trim() || null,
          skillRating: dto.skillRating ?? 0,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('team name already exists');
      }
      throw error;
    }
  }

  list(input?: {
    region?: string;
    sport?: TeamSport;
    take?: number;
    cursor?: number;
  }) {
    return this.prisma.client.team.findMany({
      ...(input?.take ? { take: input.take } : {}),
      ...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      where: {
        ...(input?.region ? { region: input.region } : {}),
        ...(input?.sport ? { sport: input.sport } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const team = await this.prisma.client.team.findUnique({
      where: { id },
    });
    if (!team) {
      throw new NotFoundException('team not found');
    }
    return team;
  }
}
