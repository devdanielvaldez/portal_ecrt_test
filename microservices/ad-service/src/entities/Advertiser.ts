import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Unique, VersionColumn } from "typeorm";

@Entity('advertisers')
@Unique(['organization_id', 'name'])
export class Advertiser {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  contact_name!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ type: 'uuid' })
  organization_id!: string;

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
