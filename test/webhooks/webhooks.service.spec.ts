import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksService } from '../../src/webhooks/webhooks.service';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

describe('WebhooksService', () => {
  let service: WebhooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: WebhooksService, useValue: {} }],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
