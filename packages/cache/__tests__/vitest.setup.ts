/**
 * @fileoverview Vitest setup file for @pixielity/cache package
 * 
 * This file configures the testing environment before running tests.
 * It sets up container mocking for dependency injection tests.
 * 
 * Setup Features:
 * - Container mocking for DI tests
 * 
 * @module @pixielity/cache
 * @category Configuration
 */

import { vi } from "vitest";

/**
 * Mock @pixielity/container decorators
 * 
 * This ensures that decorator metadata doesn't interfere with tests
 * and allows us to test module behavior in isolation.
 */
vi.mock("@pixielity/container", async () => {
  const actual = await vi.importActual("@pixielity/container");
  return {
    ...actual,
    Injectable: () => (target: any) => target,
    Inject: () => (target: any, propertyKey: string, parameterIndex: number) => {},
    Module: (metadata: any) => (target: any) => target,
  };
});
