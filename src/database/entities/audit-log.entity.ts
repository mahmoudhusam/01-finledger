import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum AuditEventType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  DEPOSIT = 'deposit',
}

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  readonly accountId: number;

  @Column()
  readonly eventType: AuditEventType;

  @Column({ type: 'int' })
  readonly amountBefore: number;

  @Column({ type: 'int' })
  readonly amountAfter: number;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ nullable: true })
  readonly referenceId: number;
}
