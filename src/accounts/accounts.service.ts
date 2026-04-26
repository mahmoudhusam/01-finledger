import { BaseRepository } from '@/common/repositories/base.repository';
import { Account } from '@/database/entities/account.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { PaginatedResult } from '@/common/types/paginated-result.type';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Result } from '@/common/types/result.type';

@Injectable()
export class AccountsService {
  private readonly baseRepository: BaseRepository<Account>;
  constructor(@InjectRepository(Account) private readonly accountRepository: Repository<Account>) {
    this.baseRepository = new BaseRepository(this.accountRepository, 'accountId');
  }

  async createAccount(
    createAccountDto: CreateAccountDto,
    userId: number,
  ): Promise<Result<Account>> {
    try {
      const account = this.accountRepository.create({ ...createAccountDto, userId });
      const savedAccount = await this.accountRepository.save(account);
      return { success: true, data: savedAccount };
    } catch {
      return { success: false, error: 'Failed to create account', code: 'INTERNAL_ERROR' };
    }
  }

  async listAccounts(
    userId: number,
    limit: number = 10,
    cursor?: string,
  ): Promise<Result<PaginatedResult<Account>>> {
    try {
      const paginatedResult = await this.baseRepository.findWithPagination(
        { userId },
        { limit, cursor },
      );
      return { success: true, data: paginatedResult };
    } catch {
      return { success: false, error: 'Failed to list accounts', code: 'INTERNAL_ERROR' };
    }
  }

  async getAccountById(accountId: number, userId: number): Promise<Result<Account>> {
    const account = await this.accountRepository.findOne({ where: { accountId, userId } });
    if (!account) {
      return { success: false, error: 'Account not found', code: 'NOT_FOUND' };
    }
    return { success: true, data: account };
  }

  async updateAccount(
    accountId: number,
    userId: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Result<Account>> {
    const account = await this.accountRepository.findOne({ where: { accountId, userId } });
    if (!account) {
      return { success: false, error: 'Account not found', code: 'NOT_FOUND' };
    }
    Object.assign(account, updateAccountDto);
    try {
      const updatedAccount = await this.accountRepository.save(account);
      return { success: true, data: updatedAccount };
    } catch {
      return { success: false, error: 'Failed to update account', code: 'INTERNAL_ERROR' };
    }
  }
}
