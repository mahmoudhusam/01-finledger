import { Injectable } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';

@Injectable()
export class HealthService {
  constructor(
    private readonly dbIndicator: TypeOrmHealthIndicator,
    private readonly healthCheckService: HealthCheckService,
    private readonly redisIndicator: RedisHealthIndicator,
  ) {}

  async check() {
    return this.healthCheckService.check([
      () => this.dbIndicator.pingCheck('database'),
      () => this.redisIndicator.isHealthy('redis'),
    ]);
  }
}
