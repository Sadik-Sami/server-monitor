import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm/dist/common/typeorm.utils';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Mocked<Repository<User>>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mock<Repository<User>>(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Mocked<Repository<User>>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user: User = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
    repo.save.mockResolvedValue(user);

    const result = await service.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
    });
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john.doe@example.com',
    });
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual(user);
  });

  it('should find all users', async () => {
    const users = [
      { id: '1', name: 'John Doe', email: 'john.doe@example.com' },
      { id: '2', name: 'Jane Doe', email: 'jane.doe@example.com' },
    ];
    repo.find.mockResolvedValue(users);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalledTimes(1);
    expect(result).toEqual(users);
  });

  it('should find a user by id', async () => {
    const user = { id: '1', name: 'John Doe', email: 'john.doe@example.com' };
    repo.findOne.mockResolvedValue(user);

    const result = await service.findOne('1');

    expect(repo.findOne).toHaveBeenCalledTimes(1);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual(user);
  });

  it('should update a user', async () => {
    const user = { id: '1', name: 'John Doe', email: 'john.doe@example.com' };
    repo.findOne.mockResolvedValue(user);
    repo.save.mockResolvedValue(user);

    const result = await service.update('1', {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    });

    expect(repo.findOne).toHaveBeenCalledTimes(1);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });

    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledWith({
      ...user,
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
    });
    expect(result).toEqual(user);
  });

  it('should throw NotFoundException when updating a non-existing user', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(
      service.update('1', {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should remove a user', async () => {
    await service.remove('1');
    expect(repo.delete).toHaveBeenCalledTimes(1);
    expect(repo.delete).toHaveBeenCalledWith('1');
  });
});
