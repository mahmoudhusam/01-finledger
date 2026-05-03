import { Module } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from '@/database/entities/transaction.entity';
import { AuthModule } from '@/auth/auth.module';
import { AuditLog } from '@/database/entities/audit-log.entity';
import { IdempotencyInterceptor } from '@/common/interceptors/idempotency.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([Transfer, AuditLog]), AuthModule],
  controllers: [TransferController],
  providers: [TransferService, IdempotencyInterceptor],
})
export class TransferModule {}
