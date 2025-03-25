import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  getClient(): Redis {
    return this.redis;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  /**
   * Lock a ticket for a specific duration
   * @param ticketId The ID of the ticket to lock
   * @param profileId The ID of the user locking the ticket
   * @param ttlSeconds Time to live in seconds
   * @returns boolean indicating if the lock was successful
   */
  async lockTicket(
    ticketId: string,
    profileId: string,
    ttlSeconds = 300,
  ): Promise<boolean> {
    const key = `ticket:lock:${ticketId}`;
    // Use SET with NX option (only set if key doesn't exist)
    const result = await this.redis.set(key, profileId, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  /**
   * Release a ticket lock if it belongs to the specified user
   * @param ticketId The ID of the ticket to unlock
   * @param profileId The ID of the user who locked the ticket
   * @returns boolean indicating if the unlock was successful
   */
  async unlockTicket(ticketId: string, profileId: string): Promise<boolean> {
    const key = `ticket:lock:${ticketId}`;
    // Check if the lock belongs to this user
    const lockOwner = await this.redis.get(key);
    if (lockOwner === profileId) {
      await this.redis.del(key);
      return true;
    }
    return false;
  }

  /**
   * Check if a ticket is locked
   * @param ticketId The ID of the ticket to check
   * @returns The profile ID of the lock owner or null if not locked
   */
  async getTicketLockOwner(ticketId: string): Promise<string | null> {
    const key = `ticket:lock:${ticketId}`;
    return await this.redis.get(key);
  }
}
