import { Module } from "@abdokouta/react-di";
import { TestableService } from "@/services/testable.service";
import { TESTABLE_SERVICE } from "@/constants";

/**
 * Module for testing patterns demonstration
 * CacheService and LoggerService are available via @Global() decorators
 * No need to import CacheModule or LoggerModule explicitly
 */
@Module({
  imports: [],
  providers: [{ provide: TESTABLE_SERVICE, useClass: TestableService }],
  exports: [TESTABLE_SERVICE],
})
export class TestingModule {}
