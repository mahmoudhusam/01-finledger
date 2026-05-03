import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from './account.entity';

export enum Status {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity()
export class Transfer {
  @PrimaryGeneratedColumn()
  transactionId: number;

  @Index()
  @Column()
  fromAccountId: number;

  @Index()
  @Column()
  toAccountId: number;

  @Column({ type: 'int', default: 0 })
  amount: number;

  @Column()
  currency: string;

  @Column({ type: 'enum', enum: Status })
  status: Status;

  @Column({ type: 'varchar', nullable: true })
  note: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'fromAccountId' })
  fromAccount: Account;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'toAccountId' })
  toAccount: Account;
}
