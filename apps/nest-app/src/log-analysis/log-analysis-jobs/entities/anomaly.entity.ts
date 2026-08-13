import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { LogAnalysisJob } from './log-analysis-job.entity';

export enum AnomalySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity()
export class Anomaly {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  severity: AnomalySeverity;

  @Column({ type: 'simple-json', nullable: true })
  ticketInfo?: Record<string, any>;

  @ManyToOne(() => LogAnalysisJob, (job) => job.anomalies, {
    onDelete: 'CASCADE',
  })
  logAnalysisJob: LogAnalysisJob;
}
