import bcrypt from "bcryptjs";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, VersionColumn } from "typeorm";

@Entity('terminals')
export class Terminal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  serial_number!: string;

  @Column({ type: 'uuid', nullable: true })
  organization_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  group_id!: string | null;

  @Column({ default: 'INACTIVE' })
  status!: string;

  @Column({ default: false })
  is_claimed!: boolean;

  @Column({ nullable: true })
  device_password_hash!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;

  @VersionColumn()
  version!: number;

  async setDevicePassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    this.device_password_hash = await bcrypt.hash(password, salt);
  }

  async checkDevicePassword(password: string): Promise<boolean> {
    if (!this.device_password_hash) return false;
    return await bcrypt.compare(password, this.device_password_hash);
  }
}
