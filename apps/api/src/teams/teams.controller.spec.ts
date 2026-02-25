import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

const createServiceMock = () =>
  ({
    create: jest.fn(),
    list: jest.fn(),
  }) as unknown as TeamsService;

describe('TeamsController', () => {
  it('delegates create to service', async () => {
    const service = createServiceMock();
    const controller = new TeamsController(service);
    const dto = { name: 'Alpha', region: 'Seoul', skillRating: 2 };

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

    await controller.list('Seoul');

    expect(list).toHaveBeenCalledWith('Seoul');
  });

  it('delegates list to service without region', async () => {
    const service = createServiceMock();
    const controller = new TeamsController(service);

    const list = jest.fn().mockResolvedValue([]);
    service.list = list;

    await controller.list(undefined);

    expect(list).toHaveBeenCalledWith(undefined);
  });
});
