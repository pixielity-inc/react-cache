/**
 * Union type of all store configurations
 * 
 * Used for type-safe store configuration.
 * 
 * @module types/store-config
 */

import type { MemoryStoreConfig } from '@/interfaces/memory-store-config.interface';
import type { RedisStoreConfig } from '@/interfaces/redis-store-config.interface';
import type { NullStoreConfig } from '@/interfaces/null-store-config.interface';

export type StoreConfig = MemoryStoreConfig | RedisStoreConfig | NullStoreConfig;
