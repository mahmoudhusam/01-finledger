import { Test, TestingModule } from '@nestjs/testing';
import { TransferController } from '@/transfer/transfer.controller';
import { TransferService } from '@/transfer/transfer.service';
import { JwtGuard } from '../../src/common/guards/jwt.guard';
import { IdempotencyInterceptor } from '../../src/common/interceptors/idempotency.interceptor';

describe('TransferController', () => {
  let controller: TransferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransferController],
      providers: [{ provide: TransferService, useValue: {} }],
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(IdempotencyInterceptor)
      .useValue({ intercept: jest.fn((ctx, next) => next.handle()) })
      .compile();

    controller = module.get<TransferController>(TransferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
