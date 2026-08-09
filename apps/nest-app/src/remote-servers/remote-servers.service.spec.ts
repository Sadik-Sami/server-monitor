import { Test, TestingModule } from '@nestjs/testing';
import { RemoteServersService } from './remote-servers.service';
import {
  RemoteServer,
  RemoteServerStatus,
} from './entities/remote-server.entity';
import { CreateRemoteServerDto } from './dto/create-remote-server.dto';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DeleteResult } from 'typeorm/browser';

describe('RemoteServersService', () => {
  let service: RemoteServersService;
  let repo: Mocked<Repository<RemoteServer>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoteServersService,
        {
          provide: getRepositoryToken(RemoteServer),
          useValue: mock<Repository<RemoteServer>>(),
        },
      ],
    }).compile();

    service = module.get<RemoteServersService>(RemoteServersService);
    repo = module.get<Mocked<Repository<RemoteServer>>>(
      getRepositoryToken(RemoteServer),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  describe('create', () => {
    it('should create a new remote server', async () => {
      // Arrange
      const props: CreateRemoteServerDto = {
        name: 'Test Server',
        description: 'A test server',
        config: { region: 'us-east-1' },
      };
      const created: RemoteServer = {
        ...props,
        id: '1',
        ownerId: '1',
        status: RemoteServerStatus.UNKNOW,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);

      const result = await service.create(props, '1');

      // Assert
      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.create).toHaveBeenCalledWith({
        ...props,
        ownerId: '1',
        status: RemoteServerStatus.UNKNOW,
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return all remote servers for a given owner', async () => {
      // Arrange
      const remoteServers = [
        {
          id: '1',
          name: 'Test Server 1',
          description: 'A test server',
          config: { region: 'us-east-1' },
          ownerId: '1',
          status: RemoteServerStatus.UNKNOW,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Test Server 2',
          description: 'Another test server',
          config: { region: 'us-west-1' },
          ownerId: '1',
          status: RemoteServerStatus.UNKNOW,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      repo.find.mockResolvedValue(remoteServers);

      const result = await service.findAll('1');

      // Assert
      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(repo.find).toHaveBeenCalledWith({ where: { ownerId: '1' } });
      expect(result).toEqual(remoteServers);
    });
  });

  describe('findOne', () => {
    it('should return a remote server by id and ownerId', async () => {
      // Arrange
      const remoteServer = {
        id: '1',
        name: 'Test Server',
        description: 'A test server',
        config: { region: 'us-east-1' },
        ownerId: '1',
        status: RemoteServerStatus.UNKNOW,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repo.findOneBy.mockResolvedValue(remoteServer);

      const result = await service.findOne('1', '1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(result).toEqual(remoteServer);
    });
  });

  describe('update', () => {
    it('should update a remote server', async () => {
      // Arrange
      const remoteServer = {
        id: '1',
        name: 'Test Server',
        description: 'A test server',
        config: { region: 'us-east-1' },
        ownerId: '1',
        status: RemoteServerStatus.UNKNOW,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repo.findOneBy.mockResolvedValue(remoteServer);
      repo.save.mockResolvedValue(remoteServer);

      const result = await service.update('1', { name: 'Updated Server' }, '1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith({
        ...remoteServer,
        name: 'Updated Server',
      });
      expect(result).toEqual(remoteServer);
    });

    it('should throw NotFoundException if remote server is not found', async () => {
      // Arrange
      repo.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('1', { name: 'Updated Server' }, '1'),
      ).rejects.toThrow(NotFoundException);

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a remote server', async () => {
      // Arrange
      const remoteServer = {
        id: '1',
        name: 'Test Server',
        description: 'A test server',
        config: { region: 'us-east-1' },
        ownerId: '1',
        status: RemoteServerStatus.UNKNOW,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const deleteResult = new DeleteResult();
      repo.findOneBy.mockResolvedValue(remoteServer);
      repo.delete.mockResolvedValue(deleteResult);

      const result = await service.remove('1', '1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(repo.delete).toHaveBeenCalledTimes(1);
      expect(repo.delete).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(result).toEqual(deleteResult);
    });

    it('should throw NotFoundException if remote server is not found', async () => {
      // Arrange
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.remove('1', '1')).rejects.toThrow(NotFoundException);

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
