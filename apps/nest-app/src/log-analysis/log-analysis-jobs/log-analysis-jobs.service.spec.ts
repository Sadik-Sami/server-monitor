import { Test, TestingModule } from '@nestjs/testing';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';
import {
  LogAnalysisJob,
  LogAnalysisJobStatus,
  LogAnalysisJobType,
} from './entities/log-analysis-job.entity';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DeleteResult } from 'typeorm/browser';
import { LogSourcesService } from '@/log-sources/log-sources.service';
import { RemoteServersService } from '@/remote-servers/remote-servers.service';
import {
  LogSource,
  LogSourceType,
} from '@/log-sources/entities/log-source.entity';
import { RemoteServer } from '@/remote-servers/entities/remote-server.entity';

describe('LogAnalysisJobsService', () => {
  let service: LogAnalysisJobsService;
  let repo: Mocked<Repository<LogAnalysisJob>>;
  let logSourcesService: Mocked<LogSourcesService>;
  let remoteServersService: Mocked<RemoteServersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogAnalysisJobsService,
        {
          provide: getRepositoryToken(LogAnalysisJob),
          useValue: mock<Repository<LogAnalysisJob>>(),
        },
        {
          provide: LogSourcesService,
          useValue: mock<LogSourcesService>(),
        },
        {
          provide: RemoteServersService,
          useValue: mock<RemoteServersService>(),
        },
      ],
    }).compile();

    service = module.get<LogAnalysisJobsService>(LogAnalysisJobsService);
    repo = module.get<Mocked<Repository<LogAnalysisJob>>>(
      getRepositoryToken(LogAnalysisJob),
    );
    logSourcesService =
      module.get<Mocked<LogSourcesService>>(LogSourcesService);
    remoteServersService =
      module.get<Mocked<RemoteServersService>>(RemoteServersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repo).toBeDefined();
  });

  describe('create', () => {
    it('should create a new log analysis job', async () => {
      // Arrange
      const props: CreateLogAnalysisJobDto = {
        name: 'Test Job',
        description: 'A test job',
        type: LogAnalysisJobType.ONE_TIME,
        logSourceId: 'ls-1',
        remoteServerId: 'rs-1',
      };
      const logSource = {
        id: 'ls-1',
        ownerId: '1',
        name: 'Test Source',
        description: 'A test source',
        status: 'unknown',
        type: LogSourceType.ZABIX,
        config: { endpoint: 'http://localhost:8080' },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as LogSource;
      const remoteServer = {
        id: 'rs-1',
        name: 'Test Server',
        ownerId: '1',
        description: 'A test server',
        config: { region: 'us-east-1' },
        status: 'unknown',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as RemoteServer;
      const created: LogAnalysisJob = {
        ...props,
        id: '1',
        ownerId: '1',
        status: LogAnalysisJobStatus.INITIALIZED,
        createdAt: new Date(),
        updatedAt: new Date(),
        logSource,
        remoteServer,
      };
      logSourcesService.findOne.mockResolvedValue(logSource);
      remoteServersService.findOne.mockResolvedValue(remoteServer);
      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);

      // Act
      const result = await service.create(props, '1');

      // Assert
      expect(logSourcesService.findOne).toHaveBeenCalledTimes(1);
      expect(logSourcesService.findOne).toHaveBeenCalledWith('ls-1', '1');
      expect(remoteServersService.findOne).toHaveBeenCalledTimes(1);
      expect(remoteServersService.findOne).toHaveBeenCalledWith('rs-1', '1');
      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.create).toHaveBeenCalledWith({
        ...props,
        ownerId: '1',
        status: LogAnalysisJobStatus.INITIALIZED,
        logSource,
        remoteServer,
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('should not throw NotFoundException if log source is not provided', async () => {
      // Arrange
      const props: CreateLogAnalysisJobDto = {
        name: 'Test Job',
        description: 'A test job',
        type: LogAnalysisJobType.ONE_TIME,
        remoteServerId: 'rs-1',
      };
      const remoteServer = {
        id: 'rs-1',
        name: 'Test Server',
        ownerId: '1',
        description: 'A test server',
        config: { region: 'us-east-1' },
        status: 'unknown',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as RemoteServer;
      const created: LogAnalysisJob = {
        id: '1',
        ownerId: '1',
        name: 'Test Job',
        description: 'A test job',
        type: LogAnalysisJobType.ONE_TIME,
        status: LogAnalysisJobStatus.INITIALIZED,
        createdAt: new Date(),
        updatedAt: new Date(),
        remoteServer,
      };
      remoteServersService.findOne.mockResolvedValue(remoteServer);
      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);

      // Act
      const result = await service.create(props, '1');

      // Assert
      expect(logSourcesService.findOne).not.toHaveBeenCalled();
      expect(remoteServersService.findOne).toHaveBeenCalledTimes(1);
      expect(remoteServersService.findOne).toHaveBeenCalledWith('rs-1', '1');
      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(repo.create).toHaveBeenCalledWith({
        ...props,
        ownerId: '1',
        status: LogAnalysisJobStatus.INITIALIZED,
        remoteServer,
      });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(created);
    });

    it('should throw NotFoundException if remote server is not found', async () => {
      // Arrange
      const props: CreateLogAnalysisJobDto = {
        name: 'Test Job',
        description: 'A test job',
        type: LogAnalysisJobType.ONE_TIME,
        logSourceId: 'ls-1',
        remoteServerId: 'rs-1',
      };
      remoteServersService.findOne.mockResolvedValue(null);

      // Act
      await expect(service.create(props, '1')).rejects.toThrow(
        NotFoundException,
      );

      // Assert
      expect(remoteServersService.findOne).toHaveBeenCalledTimes(1);
      expect(remoteServersService.findOne).toHaveBeenCalledWith('rs-1', '1');
      expect(logSourcesService.findOne).not.toHaveBeenCalled();
      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all log analysis jobs for a given owner', async () => {
      // Arrange
      const logAnalysisJobs = [
        {
          id: '1',
          ownerId: '1',
          name: 'Test Job',
          description: 'A test job',
          type: LogAnalysisJobType.ONE_TIME,
          status: LogAnalysisJobStatus.INITIALIZED,
          createdAt: new Date(),
          updatedAt: new Date(),
          logSource: {} as LogSource,
          remoteServer: {} as RemoteServer,
        },
      ];
      repo.find.mockResolvedValue(logAnalysisJobs);

      // Act
      const result = await service.findAll('1');

      // Assert
      expect(repo.find).toHaveBeenCalledTimes(1);
      expect(repo.find).toHaveBeenCalledWith({ where: { ownerId: '1' } });
      expect(result).toEqual(logAnalysisJobs);
    });
  });

  describe('findOne', () => {
    it('should return a log analysis job by id and ownerId', async () => {
      // Arrange
      const logAnalysisJob = {
        id: '1',
        ownerId: '1',
        name: 'Test Job',
        description: 'A test job',
        type: LogAnalysisJobType.ONE_TIME,
        status: LogAnalysisJobStatus.INITIALIZED,
        createdAt: new Date(),
        updatedAt: new Date(),
        logSource: {} as LogSource,
        remoteServer: {} as RemoteServer,
      };
      repo.findOneBy.mockResolvedValue(logAnalysisJob);

      const result = await service.findOne('1', '1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(result).toEqual(logAnalysisJob);
    });
  });

  describe('update', () => {
    it('should update a log analysis job', async () => {
      // Arrange
      const logAnalysisJob = {
        id: '1',
        ownerId: '1',
        name: 'Test Job',
        description: 'A test job',
        type: LogAnalysisJobType.ONE_TIME,
        status: LogAnalysisJobStatus.INITIALIZED,
        createdAt: new Date(),
        updatedAt: new Date(),
        logSource: {} as LogSource,
        remoteServer: {} as RemoteServer,
      };
      repo.findOneBy.mockResolvedValue(logAnalysisJob);
      repo.save.mockResolvedValue(logAnalysisJob);

      // Act
      const result = await service.update('1', { name: 'Updated Job' }, '1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(repo.save).toHaveBeenCalledTimes(1);
      expect(repo.save).toHaveBeenCalledWith({
        ...logAnalysisJob,
        name: 'Updated Job',
      });
      expect(result).toEqual(logAnalysisJob);
    });

    it('should throw NotFoundException if log analysis job is not found', async () => {
      // Arrange
      repo.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('1', { name: 'Updated Job' }, '1'),
      ).rejects.toThrow(NotFoundException);

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a log analysis job', async () => {
      // Arrange
      const logAnalysisJob = {
        id: '1',
        ownerId: '1',
        name: 'Test Job',
        description: 'A test job',
        type: LogAnalysisJobType.ONE_TIME,
        status: LogAnalysisJobStatus.INITIALIZED,
        createdAt: new Date(),
        updatedAt: new Date(),
        logSource: {} as LogSource,
        remoteServer: {} as RemoteServer,
      };
      const deleteResult = new DeleteResult();
      repo.findOneBy.mockResolvedValue(logAnalysisJob);
      repo.delete.mockResolvedValue(deleteResult);

      // Act
      const result = await service.remove('1', '1');

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(repo.delete).toHaveBeenCalledTimes(1);
      expect(repo.delete).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(result).toEqual(deleteResult);
    });

    it('should throw NotFoundException if log analysis job is not found', async () => {
      // Arrange
      repo.findOneBy.mockResolvedValue(null);

      // Act
      await expect(service.remove('1', '1')).rejects.toThrow(NotFoundException);

      // Assert
      expect(repo.findOneBy).toHaveBeenCalledTimes(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: '1', ownerId: '1' });
      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
