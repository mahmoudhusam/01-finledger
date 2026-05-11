import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { DataSource } from 'typeorm';
import { Account } from '@/database/entities/account.entity';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { ThrottlerExceptionFilter } from '@/common/filters/throttler-exception.filter';

describe('Transfer flow (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let checkingAccountId: number;
  let savingsAccountId: number;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    // Must match main.ts exactly
    app.useGlobalFilters(new ThrottlerExceptionFilter(), new HttpExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM transfer');
    await dataSource.query('DELETE FROM account');
    await dataSource.query('DELETE FROM "user"');
    await app.close();
  });

  it('step 1: register user A', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ fullName: 'User A', email: 'usera@test.com', password: 'Password123!' });

    expect(res.status).toBe(201);
  });

  it('step 2: login and save accessToken', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'usera@test.com', password: 'Password123!' });

    expect(res.status).toBe(201);
    accessToken = res.body.accessToken; // save for later steps
    expect(accessToken).toBeDefined();
  });

  it('step 3: create checking account', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ accountName: 'Checking', accountType: 'checking', currency: 'USD' });

    expect(res.status).toBe(201);
    checkingAccountId = res.body.accountId;

    // Seed balance directly — the API has no deposit endpoint
    await dataSource.getRepository(Account).update(checkingAccountId, { balance: 10000 });
  });

  it('step 4: create savings account', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/accounts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ accountName: 'Savings', accountType: 'savings', currency: 'USD' });

    expect(res.status).toBe(201);
    savingsAccountId = res.body.accountId;
  });

  it('step 5: transfer 3000 from checking to savings', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/transfer')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', 'test-transfer-001')
      .send({ fromAccountId: checkingAccountId, toAccountId: savingsAccountId, amount: 3000, currency: 'USD' });

    expect(res.status).toBe(201);
  });

  it('step 6: verify balances', async () => {
    const checking = await request(app.getHttpServer())
      .get(`/v1/accounts/${checkingAccountId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    const savings = await request(app.getHttpServer())
      .get(`/v1/accounts/${savingsAccountId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(checking.body.balance).toBe(7000);
    expect(savings.body.balance).toBe(3000);
  });
});
