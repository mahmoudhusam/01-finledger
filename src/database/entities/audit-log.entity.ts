import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AuditEventType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  DEPOSIT = 'deposit',
}

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  accountId: number;

  @Column()
  eventType: AuditEventType;

  @Column({ type: 'int' })
  amount: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ nullable: true })
  transferId: number;
}
