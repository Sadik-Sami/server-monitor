import { Module } from '@nestjs/common';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';
import { LogAnalysisJobsController } from './log-analysis-jobs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogAnalysisJob } from './entities/log-analysis-job.entity';
import { LogSourcesModule } from 'src/log-sources/log-sources.module';
import { RemoteServersModule } from 'src/remote-servers/remote-servers.module';
import { Anomaly } from './entities/anomaly.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogAnalysisJob, Anomaly]),
    LogSourcesModule,
    RemoteServersModule,
  ],
  controllers: [LogAnalysisJobsController],
  providers: [LogAnalysisJobsService],
})
export class LogAnalysisJobsModule {}
