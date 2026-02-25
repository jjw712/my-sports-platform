import { TeamsService } from './teams.service';
import { PrismaService } from '../prisma.service';

const createPrismaMock = () =>
  ({
    client: {
      team: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    },
  }) as unknown as PrismaService;

describe('TeamsService', () => {
  it('creates team with default skillRating=0 when omitted', async () => {
    const prisma = createPrismaMock();
    const service = new TeamsService(prisma);
    const dto = { name: 'Alpha', region: 'Seoul' };

    const create = jest
      .fn()
      .mockResolvedValue({ id: 1, ...dto, skillRating: 0 });
    prisma.client.team.create = create;

    await service.create(dto);

    expect(create).toHaveBeenCalledWith({
      data: {
        name: 'Alpha',
        region: 'Seoul',
        skillRating: 0,
      },
    });
  });

  it('creates team with provided skillRating', async () => {
    const prisma = createPrismaMock();
    const service = new TeamsService(prisma);
    const dto = { name: 'Beta', region: 'Busan', skillRating: 4 };

    const create = jest.fn().mockResolvedValue({ id: 1, ...dto });
    prisma.client.team.create = create;

    await service.create(dto);

    expect(create).toHaveBeenCalledWith({
      data: {
        name: 'Beta',
        region: 'Busan',
        skillRating: 4,
      },
    });
  });

  it('lists teams without region filter', async () => {
    const prisma = createPrismaMock();
    const service = new TeamsService(prisma);

    const findMany = jest.fn().mockResolvedValue([]);
    prisma.client.team.findMany = findMany;

    await service.list();

    expect(findMany).toHaveBeenCalledWith({
      where: undefined,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('lists teams filtered by region', async () => {
    const prisma = createPrismaMock();
    const service = new TeamsService(prisma);

    const findMany = jest.fn().mockResolvedValue([]);
    prisma.client.team.findMany = findMany;

    await service.list('Seoul');

    expect(findMany).toHaveBeenCalledWith({
      where: { region: 'Seoul' },
      orderBy: { createdAt: 'desc' },
    });
  });
});
