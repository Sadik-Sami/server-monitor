import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mock<UsersService>(),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<Mocked<UsersService>>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
    service.create.mockResolvedValue(user);

    const createUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
    };

    const result = await controller.create(createUserDto);

    expect(service.create.mock.calls[0][0]).toEqual(createUserDto);
    expect(result).toEqual(user);
  });

  it('should find all users', async () => {
    const users = [
      { id: '1', name: 'John Doe', email: 'john.doe@example.com' },
      { id: '2', name: 'Jane Doe', email: 'jane.doe@example.com' },
    ];
    service.findAll.mockResolvedValue(users);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(users);
  });

  it('should find a user by id', async () => {
    const user = { id: '1', name: 'John Doe', email: 'john.doe@example.com' };
    service.findOne.mockResolvedValue(user);

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledTimes(1);
    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual(user);
  });

  it('should update a user', async () => {
    const updatedUser = {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
    };
    service.update.mockResolvedValue(updatedUser);

    const updateUserDto = {
      name: 'John Smith',
      email: 'john.smith@example.com',
    };
    const result = await controller.update('1', updateUserDto);

    expect(service.update).toHaveBeenCalledTimes(1);
    expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
    expect(result).toEqual(updatedUser);
  });

  it('should remove a user', async () => {
    const user = {} as any;
    service.remove.mockResolvedValue(user);

    const result = await controller.remove('1');

    expect(service.remove).toHaveBeenCalledTimes(1);
    expect(service.remove).toHaveBeenCalledWith('1');
    expect(result).toEqual(user);
  });
});
