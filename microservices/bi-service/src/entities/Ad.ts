import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, VersionColumn } from "typeorm";

export enum AdStatus { PENDING = 'PENDING', ACTIVE = 'ACTIVE', REJECTED = 'REJECTED', INACTIVE = 'INACTIVE' }
export enum MediaType { IMAGE = 'IMAGE', VIDEO = 'VIDEO' }

@Entity('ads')
export class Ad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column() name!: string;
  @Column({ type: 'uuid' }) organization_id!: string;
  @Column({ type: 'uuid' }) advertiser_id!: string;
  @Column() media_url!: string;
  @Column({ type: 'enum', enum: MediaType }) media_type!: MediaType;
  @Column({ default: true }) is_all_day!: boolean;
  @Column({ type: 'time', nullable: true }) start_time!: string | null;
  @Column({ type: 'time', nullable: true }) end_time!: string | null;
  @Column("text", { array: true, default: ['MON','TUE','WED','THU','FRI','SAT','SUN'] }) days_of_week!: string[];
  @Column({ type: 'enum', enum: AdStatus, default: AdStatus.PENDING }) status!: AdStatus;
  @CreateDateColumn() created_at!: Date;
  @UpdateDateColumn() updated_at!: Date;
  @DeleteDateColumn() deleted_at!: Date;
  @VersionColumn() version!: number;
}
