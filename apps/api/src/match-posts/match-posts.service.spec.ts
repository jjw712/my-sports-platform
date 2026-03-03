import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MatchPostsService } from './match-posts.service';
import { PrismaService } from '../prisma.service';

const createPrismaMock = () =>
  ({
    client: {
      matchPost: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    },
  }) as unknown as PrismaService;

describe('MatchPostsService', () => {
  it('lists match posts with region and date range filters', async () => {
    const prisma = createPrismaMock();
    const service = new MatchPostsService(prisma);

    const findMany = jest.fn().mockResolvedValue([]);
    prisma.client.matchPost.findMany = findMany;

    const rangeStart = new Date('2025-01-01T00:00:00.000Z');
    const rangeEnd = new Date('2025-01-02T00:00:00.000Z');

    await service.list({
      region: 'Seoul',
      take: 20,
      cursor: 10,
      includeClosed: false,
      rangeStart,
      rangeEnd,
    });

    expect(findMany).toHaveBeenCalledWith({
      take: 20,
      cursor: { id: 10 },
      skip: 1,
      where: {
        status: 'OPEN',
        venue: { sido: 'Seoul' },
        slots: {
          some: {
            endAt: { gt: rangeStart },
            startAt: { lt: rangeEnd },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        venue: true,
        hostTeam: true,
        slots: true,
      },
    });
  });

  it('normalizes sport for host/challenger teams in get response', async () => {
    const prisma = createPrismaMock();
    const service = new MatchPostsService(prisma);

    prisma.client.matchPost.findUnique = jest.fn().mockResolvedValue({
      id: 1,
      hostTeam: { id: 11, name: 'Host', sport: 'FOOTBALL', region: null },
      challenges: [
        {
          id: 21,
          status: 'PENDING',
          challengerTeamId: 101,
          slotId: 1,
          createdAt: new Date().toISOString(),
          challengerTeam: { id: 101, name: 'A', sport: 'soccer', region: null },
        },
        {
          id: 22,
          status: 'PENDING',
          challengerTeamId: 102,
          slotId: 2,
          createdAt: new Date().toISOString(),
          challengerTeam: { id: 102, name: 'B', sport: '축구', region: null },
        },
      ],
      venue: {},
      slots: [],
    });

    const post = await service.get(1);

    expect(post.hostTeam.sport).toBe('SOCCER');
    expect(post.challenges[0].challengerTeam?.sport).toBe('SOCCER');
    expect(post.challenges[1].challengerTeam?.sport).toBe('SOCCER');
  });

  it('throws 400 when challenge team sport is unknown', async () => {
    const prisma = createPrismaMock();
    const service = new MatchPostsService(prisma);

    prisma.client.matchPost.findUnique = jest.fn().mockResolvedValue({
      id: 1,
      hostTeam: { id: 11, name: 'Host', sport: 'SOCCER', region: null },
      challenges: [
        {
          id: 21,
          status: 'PENDING',
          challengerTeamId: 101,
          slotId: 1,
          createdAt: new Date().toISOString(),
          challengerTeam: { id: 101, name: 'A', sport: 'volleyball', region: null },
        },
      ],
      venue: {},
      slots: [],
    });

    await expect(service.get(1)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('includes closed posts when includeClosed is true', async () => {
    const prisma = createPrismaMock();
    const service = new MatchPostsService(prisma);

    const findMany = jest.fn().mockResolvedValue([]);
    prisma.client.matchPost.findMany = findMany;

    await service.list({
      take: 20,
      includeClosed: true,
    });

    expect(findMany).toHaveBeenCalledWith({
      take: 20,
      where: {
        status: { in: ['OPEN', 'CLOSED'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        venue: true,
        hostTeam: true,
        slots: true,
      },
    });
  });

  it('throws 404 when match post is missing', async () => {
    const prisma = createPrismaMock();
    const service = new MatchPostsService(prisma);

    const findUnique = jest.fn().mockResolvedValue(null);
    prisma.client.matchPost.findUnique = findUnique;

    await expect(service.get(123)).rejects.toBeInstanceOf(NotFoundException);
  });
});
