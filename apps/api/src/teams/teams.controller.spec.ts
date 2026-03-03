import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { BadRequestException } from '@nestjs/common';

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

  it('delegates list to service with sport/take/cursor', async () => {
    const service = createServiceMock();
    const controller = new TeamsController(service);

    const list = jest.fn().mockResolvedValue([]);
    service.list = list;

    await controller.list('soccer', '10', '3');

    expect(list).toHaveBeenCalledWith({
      sport: 'SOCCER',
      take: 10,
      cursor: 3,
    });
  });

  it('normalizes sport aliases in list query', async () => {
    const service = createServiceMock();
    const controller = new TeamsController(service);

    const list = jest.fn().mockResolvedValue([]);
    service.list = list;

    await controller.list('농구', '5', undefined);

    expect(list).toHaveBeenCalledWith({
      sport: 'BASKETBALL',
      take: 5,
      cursor: undefined,
    });
  });

  it('delegates list to service with no filters', async () => {
    const service = createServiceMock();
    const controller = new TeamsController(service);

    const list = jest.fn().mockResolvedValue([]);
    service.list = list;

    await controller.list(undefined, undefined, undefined);

    expect(list).toHaveBeenCalledWith({
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

  it('throws 400 on unknown sport query', async () => {
    const service = createServiceMock();
    const controller = new TeamsController(service);

    expect(() => controller.list('volleyball', undefined, undefined)).toThrow(
      BadRequestException,
    );
  });
});
