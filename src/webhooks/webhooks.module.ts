import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '@/database/entities/account.entity';
import { AuditLog } from '@/database/entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, AuditLog])],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
