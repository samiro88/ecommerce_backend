import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit {
  private client;

  // Mocking Redis connection in development without starting Redis
  async onModuleInit() {
    // Only initialize if Redis is available or use the local fallback
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      if (redisUrl) {
        this.client = { // Mock client object when Redis is not running
          isOpen: false,
          get: () => null,
          set: () => {},
          del: () => {},
        };
        console.log('Redis client initialized but not connected.');
      } else {
        console.warn('Redis URL not found. Redis cache will not be used.');
      }
    } catch (err) {
      console.error('Failed to initialize Redis:', err);
    }
  }

  // Mocking get, set, and del methods if Redis is not available
  async get(key: string): Promise<string | null> {
    return null; // Always return null when Redis isn't running
  }

  async set(key: string, value: string, ttlSeconds = 3600): Promise<void> {
    // Do nothing if Redis isn't connected
  }

  async del(key: string): Promise<void> {
    // Do nothing if Redis isn't connected
  }
}
