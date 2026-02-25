import { NotFoundException } from '@nestjs/common';
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
        venue: { region: 'Seoul' },
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
