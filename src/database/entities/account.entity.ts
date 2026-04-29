import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CRYPTO = 'crypto',
}

@Index(['accountId', 'userId'])
@Index(['userId', 'accountName'], { unique: true })
@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  accountId: number;

  @Column()
  userId: number;

  @Column()
  accountName: string;

  @Column({ type: 'enum', enum: AccountType })
  accountType: AccountType;

  @Column({ type: 'int', default: 0 })
  balance: number;

  @Column()
  currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
