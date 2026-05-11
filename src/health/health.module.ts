import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { TerminusModule, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthService, RedisHealthIndicator, TypeOrmHealthIndicator],
})
export class HealthModule {}
