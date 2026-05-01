import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, VersionColumn } from "typeorm";

export enum PaymentMethod { CHIP = 'CHIP', TAP = 'TAP', SWIPE = 'SWIPE' }
export enum CardBrand { VISA = 'VISA', MASTERCARD = 'MASTERCARD', AMEX = 'AMEX', SUBSIDIZED = 'SUBSIDIZED' }

@Entity('transactions')
@Index(['organization_id', 'created_at'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  terminal_id!: string;

  @Column({ type: 'uuid' })
  organization_id!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method!: PaymentMethod;

  @Column({ type: 'enum', enum: CardBrand })
  card_brand!: CardBrand;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  @CreateDateColumn()
  created_at!: Date;

  @VersionColumn()
  version!: number;
}
