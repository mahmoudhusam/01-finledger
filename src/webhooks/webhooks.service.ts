import { Account } from '@/database/entities/account.entity';
import { AuditEventType } from '@/database/entities/audit-log.entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateWebhookDepositDto } from './dto/create-webhook-deposit.dto';
import * as crypto from 'crypto';
import { createAuditLog } from '@/utils/helpers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhooksService {
  private readonly webhookSecret: string;
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.webhookSecret = this.configService.getOrThrow<string>('WEBHOOK_SECRET');
  }

  async processDeposit(createWebhookDepositDto: CreateWebhookDepositDto, signature: string) {
    const { amount, toAccountId } = createWebhookDepositDto;

    if (!this.verifySignature(createWebhookDepositDto, signature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
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

  private verifySignature(dto: CreateWebhookDepositDto, signature: string): boolean {
    const { amount, currency, toAccountId } = dto;
    const payload = JSON.stringify({ amount, currency, toAccountId });
    const hash = crypto.createHmac('sha256', this.webhookSecret).update(payload).digest('hex');

    const hashBuf = Buffer.from(hash, 'hex');
    const sigBuf = Buffer.from(signature, 'hex');
    if (hashBuf.length !== sigBuf.length) return false;

    return crypto.timingSafeEqual(hashBuf, sigBuf);
  }
}
