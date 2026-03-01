import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(input: {
    teamId?: number;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    take: number;
    cursor?: number;
  }) {
    const items = await this.prisma.client.match.findMany({
      take: input.take,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      where: {
        status: input.status,
        ...(input.teamId
          ? {
              OR: [
                { hostTeamId: input.teamId },
                { awayTeamId: input.teamId },
              ],
            }
          : {}),
      },
      orderBy: [{ startAt: 'asc' }, { id: 'asc' }],
      include: {
        hostTeam: {
          select: {
            id: true,
            name: true,
            sport: true,
            region: true,
            skillRating: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            sport: true,
            region: true,
            skillRating: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            sido: true,
            sigungu: true,
            lat: true,
            lng: true,
          },
        },
        matchPost: {
          select: { id: true, title: true },
        },
      },
    });

    const nextCursor =
      items.length === input.take ? items[items.length - 1].id : null;

    return { items, nextCursor };
  }
}
