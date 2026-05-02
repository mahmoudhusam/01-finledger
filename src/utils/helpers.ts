//createAuditLog helper method to create an audit log entry for a transfer
import { AuditEventType, AuditLog } from '@/database/entities/audit-log.entity';
import { QueryRunner } from 'typeorm';

export async function createAuditLog(
  transactionManager: QueryRunner,
  accountId: number,
  eventType: AuditEventType,
  amountBefore: number,
  amountAfter: number,
  referenceId?: number,
): Promise<void> {
  const auditLog = transactionManager.manager.create(AuditLog, {
    accountId,
    eventType,
    amountBefore,
    amountAfter,
    referenceId,
  });
  await transactionManager.manager.save(auditLog);
}
