import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, VersionColumn } from "typeorm";

export enum UserRole { ADMIN = 'ADMIN', ORG_USER = 'ORG_USER' }

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ORG_USER })
  role!: UserRole;

  @Column({ type: 'uuid', nullable: true })
  organization_id!: string | null;

  @Column({ default: 'ACTIVE' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;

  @VersionColumn()
  version!: number;
}
