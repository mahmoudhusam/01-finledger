import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from '@/accounts/accounts.controller';
import { AccountsService } from '@/accounts/accounts.service';
import { JwtGuard } from '../../src/common/guards/jwt.guard';

describe('AccountsController', () => {
  let controller: AccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [{ provide: AccountsService, useValue: {} }],
    })
    .overrideGuard(JwtGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AccountsController>(AccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
