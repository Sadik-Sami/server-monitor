import { Test, TestingModule } from '@nestjs/testing';
import { LogSourcesService } from './log-sources.service';
import {
  LogSource,
  LogSourceStatus,
  LogSourceType,
} from './entities/log-source.entity';
import { CreateLogSourceDto } from './dto/create-log-source.dto';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DeleteResult } from 'typeorm/browser';

describe('LogSourcesService', () => {
  let service: LogSourcesService;
  let repo: Mocked<Repository<LogSource>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogSourcesService,
        {
          provide: getRepositoryToken(LogSource),
          useValue: mock<Repository<LogSource>>(),
        },
      ],
    }).compile();

    service = module.get<LogSourcesService>(LogSourcesService);
    repo = module.get<Mocked<Repository<LogSource>>>(
      getRepositoryToken(LogSource),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  describe('create', () => {
    it('should create a new log source', async () => {
      // Arrange
      const props: CreateLogSourceDto = {
        name: 'Test Source',
        description: 'A test source',
        config: { endpoint: 'http://localhost:8080' },
        type: LogSourceType.ZABIX,
      };
      const created: LogSource = {
        ...props,
        id: '1',
        ownerId: '1',
        status: LogSourceStatus.UNKNOWN,
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
        status: LogSourceStatus.UNKNOWN,
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return all log sources for a given owner', async () => {
      // Arrange
      const logSources = [
        {
          id: '1',
          name: 'Test Source 1',
          description: 'A test source',
          config: { endpoint: 'http://localhost:8080' },
          ownerId: '1',
          status: LogSourceStatus.UNKNOWN,
          type: LogSourceType.ZABIX,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Test Source 2',
          description: 'Another test source',
          config: { endpoint: 'http://localhost:9090' },
          ownerId: '1',
          status: LogSourceStatus.UNKNOWN,
          type: LogSourceType.PROMETHEUS,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      repo.find.mockResolvedValue(logSources);

      const result = await service.findAll('1');

      // Assert
      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(repo.find).toHaveBeenCalledWith({ where: { ownerId: '1' } });
      expect(result).toEqual(logSources);
    });
  });

  describe('findOne', () => {
    it('should return a log source by id and ownerId', async () => {
      // Arrange
      const logSource = {
        id: '1',
        name: 'Test Source',
        description: 'A test source',
        config: { endpoint: 'http://localhost:8080' },
        ownerId: '1',
        status: LogSourceStatus.UNKNOWN,
        type: LogSourceType.ZABIX,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repo.findOneBy.mockResolvedValue(logSource);

      const result = await service.findOne('1', '1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(result).toEqual(logSource);
    });
  });

  describe('update', () => {
    it('should update a log source', async () => {
      // Arrange
      const logSource = {
        id: '1',
        name: 'Test Source',
        description: 'A test source',
        config: { endpoint: 'http://localhost:8080' },
        ownerId: '1',
        status: LogSourceStatus.UNKNOWN,
        type: LogSourceType.ZABIX,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repo.findOneBy.mockResolvedValue(logSource);
      repo.save.mockResolvedValue(logSource);

      const result = await service.update('1', { name: 'Updated Source' }, '1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith({
        ...logSource,
        name: 'Updated Source',
      });
      expect(result).toEqual(logSource);
    });

    it('should throw NotFoundException if log source is not found', async () => {
      // Arrange
      repo.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('1', { name: 'Updated Source' }, '1'),
      ).rejects.toThrow(NotFoundException);

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a log source', async () => {
      // Arrange
      const logSource = {
        id: '1',
        name: 'Test Source',
        description: 'A test source',
        config: { endpoint: 'http://localhost:8080' },
        ownerId: '1',
        status: LogSourceStatus.UNKNOWN,
        type: LogSourceType.ZABIX,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const deleteResult = new DeleteResult();
      repo.findOneBy.mockResolvedValue(logSource);
      repo.delete.mockResolvedValue(deleteResult);

      const result = await service.remove('1', '1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(repo.delete).toHaveBeenCalledTimes(1);
      expect(repo.delete).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(result).toEqual(deleteResult);
    });

    it('should throw NotFoundException if log source is not found', async () => {
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
