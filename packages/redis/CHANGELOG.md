# Changelog

All notable changes to @abdokouta/react-redis will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-04-05

### Fixed

- Replaced `forRoot` helper with inline `DynamicModule` object in `RedisModule.forRoot()` for compatibility with `@abdokouta/react-di` v2
- Providers now correctly respect `isGlobal` flag per-provider

### Added

- `isGlobal` option to `RedisConfig` — controls whether Redis providers are registered globally (defaults to `true`)

## [1.0.0] - 2024-01-XX

### Added

- Initial release of @abdokouta/react-redis
- Browser-compatible Redis operations using Upstash HTTP API
- `RedisService` for connection management
- `RedisModule` for dependency injection configuration
- Support for multiple named connections
- React hooks: `useRedis()` and `useRedisConnection()`
- Comprehensive TypeScript types and JSDoc documentation
- Connection interfaces: `RedisConnection`, `RedisConnector`
- Configuration interfaces: `RedisConfig`, `RedisConnectionConfig`
- `UpstashConnection` implementation for Upstash Redis HTTP client
- `UpstashConnector` for creating Upstash connections
- Pipeline support for batching operations
- Retry configuration with exponential backoff
- Timeout configuration for requests
- Auto-pipelining support
- Complete Redis operations:
  - Basic key-value operations (get, set, del, exists, expire, ttl)
  - Multi-key operations (mget, mset)
  - Increment/decrement operations (incr, incrby, decr, decrby)
  - Sorted set operations (zadd, zrange, zrem, zremrangebyscore)
  - Lua script execution (eval)
  - Pipeline operations for batching
  - Maintenance operations (flushdb, disconnect)

### Documentation

- Comprehensive README with quick start guide
- API reference documentation
- Common patterns and best practices
- Browser compatibility information
- TypeScript usage examples
- React hooks examples
- Multiple connection configuration examples
- EXAMPLES.md with detailed usage scenarios

### Features

- ✅ Browser-compatible (no Node.js required)
- ✅ Multiple named connections
- ✅ Dependency injection support
- ✅ React hooks
- ✅ Full TypeScript support
- ✅ Production-ready error handling
- ✅ Automatic retries with backoff
- ✅ Request timeouts
- ✅ Pipeline support for performance
- ✅ Lazy connection initialization
- ✅ Connection caching and reuse
- ✅ Graceful cleanup

## [Unreleased]

### Planned

- Connection health checks
- Metrics and monitoring hooks
- Advanced caching patterns
- Cache invalidation strategies
- Distributed lock improvements
- Rate limiting utilities
- Session management utilities
- Integration with @abdokouta/cache package
