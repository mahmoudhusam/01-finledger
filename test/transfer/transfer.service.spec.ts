import { Test } from '@nestjs/testing';
import { TransferService } from '@/transfer/transfer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transfer } from '@/database/entities/transaction.entity';
import { AuditLog } from '@/database/entities/audit-log.entity';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TransferService', () => {
  let transferService: TransferService;
  let mockQueryRunner: any;
  let mockDataSource: any;

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn().mockReturnValue({}),
      },
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module = await Test.createTestingModule({
      providers: [
        TransferService,
        {
          provide: getRepositoryToken(Transfer),
          useValue: mockQueryRunner.manager,
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockQueryRunner.manager,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    transferService = module.get<TransferService>(TransferService);
  });

  it('should throw BadRequestException when  balance is insufficient', async () => {
    mockQueryRunner.manager.findOne
      .mockResolvedValueOnce({ accountId: 1, userId: 1, balance: 100, currency: 'USD' }) // fromAccount
      .mockResolvedValueOnce({ accountId: 2, userId: 2, balance: 0, currency: 'USD' }); // toAccount

    await expect(
      transferService.transfer(
        { fromAccountId: 1, toAccountId: 2, amount: 500, currency: 'USD' },
        1,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when fromAccount does not exist', async () => {
    mockQueryRunner.manager.findOne
      .mockResolvedValueOnce({ accountId: 1, userId: 999, balance: 1000, currency: 'USD' })
      .mockResolvedValueOnce({ accountId: 2, userId: 2, balance: 1000, currency: 'USD' }); // toAccount

    await expect(
      transferService.transfer(
        { fromAccountId: 1, toAccountId: 2, amount: 100, currency: 'USD' },
        1,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when toAccount does not exist', async () => {
    mockQueryRunner.manager.findOne
      .mockResolvedValueOnce({ accountId: 1, userId: 1, balance: 1000, currency: 'USD' }) // fromAccount
      .mockResolvedValueOnce(null); // toAccount

    await expect(
      transferService.transfer(
        { fromAccountId: 1, toAccountId: 2, amount: 100, currency: 'USD' },
        1,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should call rollbackTransaction when an error occurs', async () => {
    mockQueryRunner.manager.findOne.mockRejectedValue(new Error('DB error'));

    await expect(
      transferService.transfer(
        { fromAccountId: 1, toAccountId: 2, amount: 100, currency: 'USD' },
        1,
      ),
    ).rejects.toThrow();

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it('should call release in finally block even when an error is thrown', async () => {
    mockQueryRunner.manager.findOne.mockRejectedValue(new Error('DB error'));

    await expect(
      transferService.transfer(
        { fromAccountId: 1, toAccountId: 2, amount: 100, currency: 'USD' },
        1,
      ),
    ).rejects.toThrow();

    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  it('should call commitTransaction on successful transfer', async () => {
    // fromAccount: owned by userId 1, has enough balance
    mockQueryRunner.manager.findOne
      .mockResolvedValueOnce({ accountId: 1, userId: 1, balance: 1000, currency: 'USD' })
      .mockResolvedValueOnce({ accountId: 2, userId: 2, balance: 500, currency: 'USD' });

    await transferService.transfer(
      { fromAccountId: 1, toAccountId: 2, amount: 300, currency: 'USD' },
      1,
    );

    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('should create two audit log entries on success', async () => {
    mockQueryRunner.manager.findOne
      .mockResolvedValueOnce({ accountId: 1, userId: 1, balance: 1000, currency: 'USD' })
      .mockResolvedValueOnce({ accountId: 2, userId: 2, balance: 500, currency: 'USD' });

    await transferService.transfer(
      { fromAccountId: 1, toAccountId: 2, amount: 300, currency: 'USD' },
      1,
    );

    expect(mockQueryRunner.manager.create).toHaveBeenCalledTimes(3);
  });
});
