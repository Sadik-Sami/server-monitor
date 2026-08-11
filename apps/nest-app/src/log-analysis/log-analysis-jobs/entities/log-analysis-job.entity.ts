import { LogSource } from '@/log-sources/entities/log-source.entity';
import { RemoteServer } from '@/remote-servers/entities/remote-server.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LogAnalysisJobStatus {
  INITIALIZED = 'INITIALIZED',
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum LogAnalysisJobType {
  ONE_TIME = 'ONE_TIME',
  RECURRING = 'RECURRING',
}

@Entity()
export class LogAnalysisJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  type: LogAnalysisJobType;

  @Column()
  status: LogAnalysisJobStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => LogSource)
  @JoinColumn()
  logSource: LogSource;

  @OneToOne(() => RemoteServer)
  @JoinColumn()
  remoteServer: RemoteServer;
}
