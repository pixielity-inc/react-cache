import { Injectable, Inject } from "@abdokouta/react-di";
import { LOGGER_SERVICE, CACHE_SERVICE } from "@/constants";

/**
 * Example service designed for testability
 * Shows dependency injection patterns that make testing easier
 */
@Injectable()
export class TestableService {
  constructor(
    @Inject(LOGGER_SERVICE) private logger: any,
    @Inject(CACHE_SERVICE) private cache: any,
  ) {
    console.log(`[TestableService] Constructor called`);
    console.log(`[TestableService] Logger injected:`, !!this.logger);
    console.log(`[TestableService] CacheService injected:`, !!this.cache);
    this.logger.info("TestableService initialized");
  }

  /**
   * Business logic that depends on injected services
   * Easy to test by mocking dependencies
   */
  async fetchUserData(
    userId: string,
  ): Promise<{ id: string; name: string; cached: boolean }> {
    this.logger.log(`Fetching user data for: ${userId}`);

    // Check cache first
    const cached = this.cache.get<{ id: string; name: string }>(
      `user:${userId}`,
    );
    if (cached) {
      this.logger.log(`Cache hit for user: ${userId}`);
      return { ...cached, cached: true };
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100));
    const userData = {
      id: userId,
      name: `User ${userId}`,
      cached: false,
    };

    // Store in cache
    this.cache.set(`user:${userId}`, userData);
    this.logger.log(`Cached user data for: ${userId}`);

    return userData;
  }

  /**
   * Pure business logic - easy to test
   */
  calculateDiscount(
    price: number,
    userLevel: "bronze" | "silver" | "gold",
  ): number {
    const discounts = {
      bronze: 0.05,
      silver: 0.1,
      gold: 0.15,
    };

    const discount = discounts[userLevel];
    return price * (1 - discount);
  }

  /**
   * Method that can be easily mocked in tests
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    this.logger.log(`Email validation for ${email}: ${isValid}`);
    return isValid;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}
