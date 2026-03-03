import { TeamsService } from './teams.service';
import { PrismaService } from '../prisma.service';
import { BadRequestException } from '@nestjs/common';

const createPrismaMock = () =>
  ({
    client: {
      team: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    },
  }) as unknown as PrismaService;

describe('TeamsService', () => {
  it('creates team with default skillRating=0 when omitted', async () => {
    const prisma = createPrismaMock();
    const service = new TeamsService(prisma);
    const dto = { name: 'Alpha', sport: 'SOCCER', region: 'Seoul' } as const;

    const create = jest
      .fn()
      .mockResolvedValue({ id: 1, ...dto, skillRating: 0, logoUrl: null, description: null });
    prisma.client.team.create = create;

    await service.create(dto);

    expect(create).toHaveBeenCalledWith({
      data: {
        name: 'Alpha',
        sport: 'SOCCER',
        region: 'Seoul',
        logoUrl: null,
        description: null,
        skillRating: 0,
      },
    });
  });

  it('creates team with provided skillRating', async () => {
    const prisma = createPrismaMock();
    const service = new TeamsService(prisma);
    const dto = { name: 'Beta', sport: 'BASEBALL', region: 'Busan', skillRating: 4 } as const;

    const create = jest.fn().mockResolvedValue({ id: 1, ...dto });
    prisma.client.team.create = create;

    await service.create(dto);

    expect(create).toHaveBeenCalledWith({
      data: {
        name: 'Beta',
        sport: 'BASEBALL',
        region: 'Busan',
        logoUrl: null,
        description: null,
        skillRating: 4,
      },
    });
  });

  it('normalizes sport aliases on create payload', async () => {
    const prisma = createPrismaMock();
    const service = new TeamsService(prisma);
    const dto = { name: 'Gamma', sport: 'soccer', region: 'Seoul' } as const;

    const create = jest
      .fn()
      .mockResolvedValue({ id: 1, name: 'Gamma', sport: 'SOCCER', region: 'Seoul' });
    prisma.client.team.create = create;

    await service.create(dto as any);

    expect(create).toHaveBeenCalledWith({
      data: {
        name: 'Gamma',
        sport: 'SOCCER',
        region: 'Seoul',
        logoUrl: null,
        description: null,
        skillRating: 0,
      },
    });
  });

  it('throws 400 for unknown sport on create payload', async () => {
    const prisma = createPrismaMock();
    const service = new TeamsService(prisma);

    await expect(
      service.create({ name: 'Delta', sport: 'volleyball' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lists teams without region filter', async () => {
    const prisma = createPrismaMock();
    const service = new TeamsService(prisma);

    const findMany = jest.fn().mockResolvedValue([]);
    prisma.client.team.findMany = findMany;

    await service.list();

    expect(findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' },
    });
  });

  it('ignores region when listing teams', async () => {
    const prisma = createPrismaMock();
    const service = new TeamsService(prisma);

    const findMany = jest.fn().mockResolvedValue([]);
    prisma.client.team.findMany = findMany;

    await service.list({ region: 'Seoul' } as any);

    expect(findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' },
    });
  });

  it('lists teams filtered by sport/take/cursor', async () => {
    const prisma = createPrismaMock();
    const service = new TeamsService(prisma);

    const findMany = jest.fn().mockResolvedValue([]);
    prisma.client.team.findMany = findMany;

    await service.list({ sport: 'SOCCER' as any, take: 10, cursor: 3 });

    expect(findMany).toHaveBeenCalledWith({
      take: 10,
      cursor: { id: 3 },
      skip: 1,
      where: { sport: 'SOCCER' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('lists teams filtered by sport only', async () => {
    const prisma = createPrismaMock();
    const service = new TeamsService(prisma);

    const findMany = jest.fn().mockResolvedValue([]);
    prisma.client.team.findMany = findMany;

    await service.list({ sport: 'BASKETBALL' as any });

    expect(findMany).toHaveBeenCalledWith({
      where: { sport: 'BASKETBALL' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('lists teams with empty input object', async () => {
    const prisma = createPrismaMock();
    const service = new TeamsService(prisma);

    const findMany = jest.fn().mockResolvedValue([]);
    prisma.client.team.findMany = findMany;

    await service.list({});

    expect(findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' },
    });
  });

  it('finds team by id', async () => {
    const prisma = createPrismaMock();
    const service = new TeamsService(prisma);

    const findUnique = jest
      .fn()
      .mockResolvedValue({ id: 1, name: 'Alpha', sport: 'SOCCER' });
    prisma.client.team.findUnique = findUnique;

    await service.findOne(1);

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
