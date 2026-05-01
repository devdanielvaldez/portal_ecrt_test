import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, VersionColumn } from "typeorm";

export enum MessageType { FLASH = 'FLASH', STICKY = 'STICKY' }

@Entity('terminal_messages')
export class TerminalMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  content!: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.FLASH })
  type!: MessageType;

  @Column({ type: 'int', default: 10 })
  duration_seconds!: number;

  @Column({ type: 'uuid', nullable: true })
  organization_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  group_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  terminal_id!: string | null;

  @Column({ default: 'ACTIVE' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @VersionColumn()
  version!: number;
}
