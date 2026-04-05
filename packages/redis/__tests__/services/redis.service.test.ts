import { describe, it, expect, beforeEach, vi } from "vitest";
import { RedisService } from "@/services/redis.service";
import type { RedisConfig, RedisConnector, RedisConnection } from "@/interfaces";

describe("RedisService", () => {
  let redisService: RedisService;
  let mockConnector: RedisConnector;
  let mockConnection: RedisConnection;
  let config: RedisConfig;

  beforeEach(() => {
    mockConnection = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      disconnect: vi.fn(),
    } as any;

    mockConnector = {
      connect: vi.fn().mockResolvedValue(mockConnection),
    };

    config = {
      default: "cache",
      connections: {
        cache: { url: "https://test.upstash.io", token: "test-token" },
        session: { url: "https://session.upstash.io", token: "session-token" },
      },
    };

    redisService = new RedisService(config, mockConnector);
  });

  describe("connection", () => {
    it("should return default connection when no name provided", async () => {
      const connection = await redisService.connection();
      expect(mockConnector.connect).toHaveBeenCalledWith(config.connections.cache);
      expect(connection).toBe(mockConnection);
    });

    it("should return named connection", async () => {
      const connection = await redisService.connection("session");
      expect(mockConnector.connect).toHaveBeenCalledWith(config.connections.session);
      expect(connection).toBe(mockConnection);
    });

    it("should cache connections", async () => {
      const conn1 = await redisService.connection("cache");
      const conn2 = await redisService.connection("cache");
      expect(mockConnector.connect).toHaveBeenCalledTimes(1);
      expect(conn1).toBe(conn2);
    });

    it("should throw error for unconfigured connection", async () => {
      await expect(redisService.connection("invalid")).rejects.toThrow(
        "Redis connection [invalid] not configured"
      );
    });
  });

  describe("disconnect", () => {
    it("should disconnect default connection", async () => {
      await redisService.connection();
      await redisService.disconnect();
      expect(mockConnection.disconnect).toHaveBeenCalled();
      expect(redisService.isConnectionActive()).toBe(false);
    });

    it("should disconnect named connection", async () => {
      await redisService.connection("session");
      await redisService.disconnect("session");
      expect(mockConnection.disconnect).toHaveBeenCalled();
      expect(redisService.isConnectionActive("session")).toBe(false);
    });

    it("should handle disconnect of non-existent connection", async () => {
      await expect(redisService.disconnect("nonexistent")).resolves.not.toThrow();
    });
  });

  describe("disconnectAll", () => {
    it("should disconnect all connections", async () => {
      await redisService.connection("cache");
      await redisService.connection("session");
      await redisService.disconnectAll();
      expect(mockConnection.disconnect).toHaveBeenCalledTimes(2);
      expect(redisService.isConnectionActive("cache")).toBe(false);
      expect(redisService.isConnectionActive("session")).toBe(false);
    });
  });

  describe("getConnectionNames", () => {
    it("should return all configured connection names", () => {
      const names = redisService.getConnectionNames();
      expect(names).toEqual(["cache", "session"]);
    });
  });

  describe("getDefaultConnectionName", () => {
    it("should return default connection name", () => {
      expect(redisService.getDefaultConnectionName()).toBe("cache");
    });
  });

  describe("isConnectionActive", () => {
    it("should return false for inactive connection", () => {
      expect(redisService.isConnectionActive("cache")).toBe(false);
    });

    it("should return true for active connection", async () => {
      await redisService.connection("cache");
      expect(redisService.isConnectionActive("cache")).toBe(true);
    });
  });
});
