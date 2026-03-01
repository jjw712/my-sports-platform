import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

const createServiceMock = () =>
  ({
    create: jest.fn(),
    list: jest.fn(),
    findOne: jest.fn(),
  }) as unknown as TeamsService;

describe('TeamsController', () => {
  it('delegates create to service', async () => {
    const service = createServiceMock();
    const controller = new TeamsController(service);
    const dto = { name: 'Alpha', sport: 'SOCCER', region: 'Seoul' } as const;

    const create = jest.fn().mockResolvedValue({ id: 1, ...dto });
    service.create = create;

    await controller.create(dto);

    expect(create).toHaveBeenCalledWith(dto);
  });

  it('delegates list to service with region', async () => {
    const service = createServiceMock();
    const controller = new TeamsController(service);

    const list = jest.fn().mockResolvedValue([]);
    service.list = list;

    await controller.list('Seoul', undefined, undefined, undefined);

    expect(list).toHaveBeenCalledWith({
      region: 'Seoul',
      sport: undefined,
      take: undefined,
      cursor: undefined,
    });
  });

  it('delegates list to service without region', async () => {
    const service = createServiceMock();
    const controller = new TeamsController(service);

    const list = jest.fn().mockResolvedValue([]);
    service.list = list;

    await controller.list(undefined, undefined, undefined, undefined);

    expect(list).toHaveBeenCalledWith({
      region: undefined,
      sport: undefined,
      take: undefined,
      cursor: undefined,
    });
  });

  it('delegates findOne to service', async () => {
    const service = createServiceMock();
    const controller = new TeamsController(service);

    const findOne = jest.fn().mockResolvedValue({ id: 1, name: 'Alpha' });
    service.findOne = findOne;

    await controller.findOne(1);

    expect(findOne).toHaveBeenCalledWith(1);
  });
});
