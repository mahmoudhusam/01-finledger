import { BaseRepository } from '@/common/repositories/base.repository';
import { Transfer } from '@/database/entities/transaction.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TransferService {
  private readonly baseRepository: BaseRepository<Transfer>;
  constructor(
    @InjectRepository(Transfer) private readonly transferRepository: Repository<Transfer>,
  ) {
    this.baseRepository = new BaseRepository(this.transferRepository, 'transferId');
  }

  // Implement transfer-related methods here
}
