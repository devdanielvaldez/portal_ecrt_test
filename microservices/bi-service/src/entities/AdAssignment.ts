import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('ad_assignments')
export class AdAssignment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'uuid' }) ad_id!: string;
  @Column({ type: 'uuid', nullable: true }) terminal_id!: string | null;
  @Column({ type: 'uuid', nullable: true }) group_id!: string | null;
  @CreateDateColumn() created_at!: Date;
}
