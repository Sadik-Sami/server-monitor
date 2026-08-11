import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LogAnalysisJobsService } from './log-analysis-jobs.service';
import { CreateLogAnalysisJobDto } from './dto/create-log-analysis-job.dto';
import { UpdateLogAnalysisJobDto } from './dto/update-log-analysis-job.dto';
import { CurrentUser } from '@/auth/current-user.decorator';
import { ICurrentUser } from '@/auth/current-user.interface';

@Controller('log-analysis-jobs')
export class LogAnalysisJobsController {
  constructor(
    private readonly logAnalysisJobsService: LogAnalysisJobsService,
  ) {}

  @Post()
  create(
    @Body() createLogAnalysisJobDto: CreateLogAnalysisJobDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.logAnalysisJobsService.create(createLogAnalysisJobDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: ICurrentUser) {
    return this.logAnalysisJobsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    return this.logAnalysisJobsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLogAnalysisJobDto: UpdateLogAnalysisJobDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.logAnalysisJobsService.update(
      id,
      updateLogAnalysisJobDto,
      user.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    return this.logAnalysisJobsService.remove(id, user.id);
  }
}
