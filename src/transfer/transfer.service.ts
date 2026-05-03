import { Account } from '@/database/entities/account.entity';
import { Status, Transfer } from '@/database/entities/transaction.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { BaseRepository } from '@/common/repositories/base.repository';
import { AuditEventType, AuditLog } from '@/database/entities/audit-log.entity';
import { createAuditLog } from '@/utils/helpers';

@Injectable()
export class TransferService {
  private readonly baseRepository: BaseRepository<Transfer>;

  constructor(
    @InjectRepository(Transfer) private readonly transferRepository: Repository<Transfer>,
    @InjectRepository(AuditLog) private readonly auditLogRepository: Repository<AuditLog>,
    private readonly dataSource: DataSource,
  ) {
    this.baseRepository = new BaseRepository(this.transferRepository, 'transactionId');
  }

  async transfer(createTransferDto: CreateTransferDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { fromAccountId, toAccountId, amount, currency } = createTransferDto;

      const [firstId, secondId] =
        fromAccountId < toAccountId ? [fromAccountId, toAccountId] : [toAccountId, fromAccountId];

      const firstAccount = await queryRunner.manager.findOne(Account, {
        where: { accountId: firstId },
        lock: { mode: 'pessimistic_write' },
      });

      const secondAccount = await queryRunner.manager.findOne(Account, {
        where: { accountId: secondId },
        lock: { mode: 'pessimistic_write' },
      });

      const fromAccount = fromAccountId === firstId ? firstAccount : secondAccount;
      const toAccount = toAccountId === firstId ? firstAccount : secondAccount;

      if (!fromAccount || fromAccount.userId !== userId) {
        throw new NotFoundException('Account not found');
      }

      if (!toAccount) {
        throw new NotFoundException('Recipient account not found');
      }

      if (fromAccount.currency !== toAccount.currency || fromAccount.currency !== currency) {
        throw new BadRequestException('Currency mismatch between accounts');
      }

      if (fromAccount.balance < amount) {
        throw new UnprocessableEntityException('Insufficient balance');
      }

      fromAccount.balance -= amount;
      await queryRunner.manager.save(fromAccount);

      toAccount.balance += amount;
      await queryRunner.manager.save(toAccount);

      const transfer = queryRunner.manager.create(Transfer, {
        fromAccountId,
        toAccountId,
        amount,
        currency,
        status: Status.COMPLETED,
      });
      await queryRunner.manager.save(transfer);

      await createAuditLog(
        queryRunner,
        fromAccountId,
        AuditEventType.DEBIT,
        fromAccount.balance + amount,
        fromAccount.balance,
        transfer.transactionId,
      );

      await createAuditLog(
        queryRunner,
        toAccountId,
        AuditEventType.CREDIT,
        toAccount.balance - amount,
        toAccount.balance,
        transfer.transactionId,
      );

      await queryRunner.commitTransaction();
      return transfer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async listTransfers(userId: number, limit: number = 10, cursor?: string) {
    const queryBuilder = this.transferRepository
      .createQueryBuilder('transfer')
      .innerJoinAndSelect('transfer.fromAccount', 'fromAccount')
      .innerJoinAndSelect('transfer.toAccount', 'toAccount')
      .where('fromAccount.userId = :userId OR toAccount.userId = :userId', { userId });

    if (cursor) {
      queryBuilder.andWhere('transfer.transactionId > :cursor', { cursor: parseInt(cursor, 10) });
    }

    const items = await queryBuilder
      .orderBy('transfer.transactionId', 'ASC')
      .limit(limit + 1)
      .getMany();

    const hasMore = items.length > limit;
    const paginatedItems = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore
      ? String(paginatedItems[paginatedItems.length - 1].transactionId)
      : undefined;

    return { items: paginatedItems, cursor: nextCursor, hasMore, count: paginatedItems.length };
  }

  async getTransferById(id: number, userId: number) {
    const transfer = await this.transferRepository
      .createQueryBuilder('transfer')
      .innerJoinAndSelect('transfer.fromAccount', 'fromAccount')
      .innerJoinAndSelect('transfer.toAccount', 'toAccount')
      .where('transfer.transactionId = :id', { id })
      .andWhere('(fromAccount.userId = :userId OR toAccount.userId = :userId)', { userId })
      .getOne();

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    return transfer;
  }
}
