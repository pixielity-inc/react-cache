/**
 * Driver Creator
 *
 * Factory function signature for creating driver instances from config.
 * Used by MultipleInstanceManager and CacheManager for custom driver registration via `extend()`.
 *
 * @typeParam T - The type of instance the creator produces
 *
 * @module types/driver-creator
 */
export type DriverCreator<T = any> = (config: Record<string, any>, prefix?: string) => T;
