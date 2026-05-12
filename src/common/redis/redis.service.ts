import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    }) as RedisClientType;
    this.client.on('error', (err) => console.error('Redis Client Error', err));
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      console.log('Connected to Redis');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
      console.log('Disconnected from Redis');
    } catch (error) {
      console.error('Failed to disconnect from Redis:', error);
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, { EX: ttlSeconds });
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async setNx(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.client.set(key, value, { EX: ttlSeconds, NX: true });
    return result === 'OK';
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.client.isReady) return false;
      await this.client.ping();
      return true;
    } catch (error) {
      console.error('Redis ping failed:', error);
      return false;
    }
  }
}
