import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, VersionColumn } from "typeorm";

@Entity('ad_impressions')
@Index(['ad_id', 'timestamp'])
@Index(['terminal_id', 'timestamp'])
export class AdImpression {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  ad_id!: string;

  @Column({ type: 'uuid' })
  terminal_id!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  @Column({ type: 'timestamp' })
  timestamp!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @VersionColumn()
  version!: number;
}
