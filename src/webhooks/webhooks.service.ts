import { Account } from '@/database/entities/account.entity';
import { AuditEventType } from '@/database/entities/audit-log.entity';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateWebhookDepositDto } from './dto/create-webhook-deposit.dto';
import * as crypto from 'crypto';
import { createAuditLog } from '@/utils/helpers';

@Injectable()
export class WebhooksService {
  constructor(private readonly dataSource: DataSource) {}

  async processDeposit(createWebhookDepositDto: CreateWebhookDepositDto) {
    const { amount, toAccountId, signature } = createWebhookDepositDto;

    const isValidSignature = this.verifySignature(createWebhookDepositDto, signature);
    if (!isValidSignature) {
      return { success: false, error: 'Invalid signature', code: 'UNAUTHORIZED' };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const account = await queryRunner.manager.findOne(Account, {
        where: { accountId: toAccountId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!account) {
        throw new Error('Account not found');
      }

      account.balance += amount;
      await queryRunner.manager.save(account);

      await createAuditLog(
        queryRunner,
        toAccountId,
        AuditEventType.CREDIT,
        account.balance - amount,
        account.balance,
      );

      await queryRunner.commitTransaction();
      return { success: true, data: account };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage, code: 'INTERNAL_ERROR' };
    } finally {
      await queryRunner.release();
    }
  }

  private verifySignature(
    createWebhookDepositDto: CreateWebhookDepositDto,
    signature: string,
  ): boolean {
    const secret = process.env.WEBHOOK_SECRET || 'default_secret';
    const { amount, currency, toAccountId } = createWebhookDepositDto;
    const bodyWithoutSignature = { amount, currency, toAccountId };
    const payload = JSON.stringify(bodyWithoutSignature);
    const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  }
}
