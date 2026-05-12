import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from '@/accounts/accounts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from '@/database/entities/account.entity';

describe('AccountsService', () => {
  let service: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: getRepositoryToken(Account), useValue: {} },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
