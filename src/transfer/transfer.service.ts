import { Account } from '@/database/entities/account.entity';
import { Status, Transfer } from '@/database/entities/transaction.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { BaseRepository } from '@/common/repositories/base.repository';

@Injectable()
export class TransferService {
  private readonly baseRepository: BaseRepository<Transfer>;

  constructor(
    @InjectRepository(Transfer) private readonly transferRepository: Repository<Transfer>,
    private readonly dataSource: DataSource,
  ) {
    this.baseRepository = new BaseRepository(this.transferRepository, 'transactionId');
  }

  async transfer(createTransferDto: CreateTransferDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const { fromAccountId, toAccountId, amount, currency } = createTransferDto;

      const fromAccount = await queryRunner.manager.findOne(Account, {
        where: { accountId: fromAccountId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromAccount) {
        throw new NotFoundException('Sender account not found');
      }
      if (fromAccount.balance < amount) {
        throw new NotFoundException('Insufficient balance');
      }

      fromAccount.balance -= amount;
      await queryRunner.manager.save(fromAccount);

      const toAccount = await queryRunner.manager.findOne(Account, {
        where: { accountId: toAccountId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!toAccount) {
        throw new NotFoundException('Recipient account not found');
      }

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

      await queryRunner.commitTransaction();

      return transfer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async listTransfers(limit: number = 10, cursor?: string) {
    const paginatedResult = await this.baseRepository.findWithPagination({}, { limit, cursor });
    return paginatedResult;
  }

  async getTransferById(id: number) {
    const transfer = await this.dataSource.getRepository(Transfer).findOne({
      where: { transactionId: id },
    });
    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }
    return transfer;
  }
}
