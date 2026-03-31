/**
 * @fileoverview Service Injection Tokens
 *
 * Centralized token definitions for dependency injection.
 * Using Symbol.for() creates global symbols that are shared across modules.
 * This prevents ambiguous bindings when the same token is used in multiple places.
 *
 * @module constants
 */

// Core Services
export const LOGGER_SERVICE = Symbol.for("LoggerService");
export const CONFIG_SERVICE = Symbol.for("ConfigService");
export const COUNTER_SERVICE = Symbol.for("CounterService");
export const USER_SERVICE = Symbol.for("UserService");

// API Services
export const API_SERVICE = Symbol.for("ApiService");
export const REQUEST_SERVICE = Symbol.for("RequestService");

// Cache Services
export const CACHE_SERVICE = Symbol.for("CacheService");
export const CACHE_CONFIG = Symbol.for("CACHE_CONFIG");

// Lifecycle Services
export const LIFECYCLE_SERVICE = Symbol.for("LifecycleService");

// Scope Services
export const TRANSIENT_SERVICE = Symbol.for("TransientService");

// Testing Services
export const TESTABLE_SERVICE = Symbol.for("TestableService");

// Config Tokens
export const APP_CONFIG = Symbol.for("APP_CONFIG");
export const API_CONFIG = Symbol.for("API_CONFIG");
