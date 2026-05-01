import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, VersionColumn } from "typeorm";
import { Organization } from "./Organization";

@Entity('agency_assignments')
export class AgencyAssignment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  agency_id!: string;

  @Column({ type: 'uuid' })
  commerce_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'agency_id' })
  agency!: Organization;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'commerce_id' })
  commerce!: Organization;

  @VersionColumn()
  version!: number;
}
