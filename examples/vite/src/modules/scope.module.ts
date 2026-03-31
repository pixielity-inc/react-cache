import { Module } from "@abdokouta/react-di";
import { RequestService } from "@/services/request.service";
import { TransientService } from "@/services/transient.service";
import { REQUEST_SERVICE, TRANSIENT_SERVICE } from "@/constants";

/**
 * Module demonstrating different service scopes
 */
@Module({
  providers: [
    {
      provide: REQUEST_SERVICE,
      useClass: RequestService,
      scope: "Transient", // New instance per injection (simulating request scope)
    },
    {
      provide: TRANSIENT_SERVICE,
      useClass: TransientService,
      scope: "Transient", // New instance every time
    },
  ],
  exports: [REQUEST_SERVICE, TRANSIENT_SERVICE],
})
export class ScopeModule {}
