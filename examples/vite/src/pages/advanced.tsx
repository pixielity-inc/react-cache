import { useState, useEffect } from "react";
import { useInject } from "@abdokouta/react-di";
import { Card, Chip, Button, Separator } from "@heroui/react";

import { ConfigService } from "@/services/config.service";
import { ApiService } from "@/services/api.service";
import { TransientService } from "@/services/transient.service";
import { RequestService } from "@/services/request.service";
import { LifecycleService } from "@/services/lifecycle.service";
import { TestableService } from "@/services/testable.service";
import { CacheService } from "@/services/cache.service";
import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import {
  CONFIG_SERVICE,
  API_SERVICE,
  TRANSIENT_SERVICE,
  REQUEST_SERVICE,
  LIFECYCLE_SERVICE,
  TESTABLE_SERVICE,
  CACHE_SERVICE,
} from "@/constants";

export default function AdvancedPage() {
  // Dynamic Module Patterns
  const configService = useInject<ConfigService>(CONFIG_SERVICE);
  const apiService = useInject<ApiService>(API_SERVICE);

  // Service Scopes
  const transientService1 = useInject<TransientService>(TRANSIENT_SERVICE);
  const transientService2 = useInject<TransientService>(TRANSIENT_SERVICE);
  const requestService1 = useInject<RequestService>(REQUEST_SERVICE);
  const requestService2 = useInject<RequestService>(REQUEST_SERVICE);

  // Lifecycle Management
  const lifecycleService = useInject<LifecycleService>(LIFECYCLE_SERVICE);

  // Advanced Patterns
  const testableService = useInject<TestableService>(TESTABLE_SERVICE);
  const cacheService = useInject<CacheService>(CACHE_SERVICE);

  // State Management
  const [apiStatus, setApiStatus] = useState(false);
  const [lifecycleStatus, setLifecycleStatus] = useState({
    initialized: false,
    resources: [] as string[],
  });
  const [cacheStats, setCacheStats] = useState({ size: 0, maxSize: 0, ttl: 0 });
  const [cacheTestKey, setCacheTestKey] = useState("");
  const [cacheTestValue, setCacheTestValue] = useState<string | undefined>();
  const [userData, setUserData] = useState<{
    id: string;
    name: string;
    cached: boolean;
  } | null>(null);
  const [emailValidation, setEmailValidation] = useState<{
    email: string;
    valid: boolean;
  } | null>(null);

  useEffect(() => {
    setApiStatus(apiService.getConnectionStatus());
    setLifecycleStatus(lifecycleService.getStatus());
    setCacheStats(testableService.getCacheStats());
  }, [apiService, lifecycleService, testableService]);

  const config = configService.getAll();

  // Cache Operations
  const handleCacheSet = () => {
    const key = `test-${Date.now()}`;
    const value = `Value at ${new Date().toLocaleTimeString()}`;
    cacheService.set(key, value);
    setCacheTestKey(key);
    setCacheStats(cacheService.getStats());
  };

  const handleCacheGet = () => {
    if (cacheTestKey) {
      const value = cacheService.get<string>(cacheTestKey);
      setCacheTestValue(value);
    }
  };

  const handleCacheClear = () => {
    cacheService.clear();
    setCacheTestKey("");
    setCacheTestValue(undefined);
    setCacheStats(cacheService.getStats());
  };

  // Testable Service Operations
  const handleFetchUser = async () => {
    const user = await testableService.fetchUserData("user-123");
    setUserData(user);
  };

  const handleValidateEmail = () => {
    const email = "test@example.com";
    const valid = testableService.validateEmail(email);
    setEmailValidation({ email, valid });
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title()}>Advanced DI Patterns</span>
          <p className="text-default-500 mt-4">
            Comprehensive demonstration of dependency injection features
          </p>
        </div>

        <div className="w-full max-w-6xl space-y-8">
          {/* Dynamic Modules Section */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Dynamic Modules</h2>
            <p className="text-default-500">
              Modules that accept runtime configuration and async initialization
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">forRoot Pattern</h3>
                <p className="text-default-500 mb-4 text-sm">
                  ConfigModule uses forRoot() to accept runtime configuration at
                  module initialization
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-32">API URL:</span>
                    <Chip size="sm" variant="soft">
                      <Chip.Label>{config.apiUrl}</Chip.Label>
                    </Chip>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-32">Timeout:</span>
                    <Chip size="sm" variant="soft">
                      <Chip.Label>{config.timeout}ms</Chip.Label>
                    </Chip>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Async Factory</h3>
                <p className="text-default-500 mb-4 text-sm">
                  ApiModule uses useAsyncFactory for async initialization with
                  external resources
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-32">Status:</span>
                    <Chip
                      color={apiStatus ? "success" : "danger"}
                      size="sm"
                      variant="soft"
                    >
                      <Chip.Label>
                        {apiStatus ? "Connected" : "Disconnected"}
                      </Chip.Label>
                    </Chip>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-32">
                      Base URL:
                    </span>
                    <Chip size="sm" variant="soft">
                      <Chip.Label>{apiService.getBaseUrl()}</Chip.Label>
                    </Chip>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Service Scopes Section */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Service Scopes</h2>
            <p className="text-default-500">
              Different lifecycle scopes control instance creation and sharing
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Transient Scope</h3>
                <p className="text-default-500 mb-4 text-sm">
                  New instance created every time the service is injected
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-32">
                      Instance 1:
                    </span>
                    <Chip color="accent" size="sm" variant="soft">
                      <Chip.Label>
                        {transientService1.getInstanceId()}
                      </Chip.Label>
                    </Chip>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-32">
                      Instance 2:
                    </span>
                    <Chip color="accent" size="sm" variant="soft">
                      <Chip.Label>
                        {transientService2.getInstanceId()}
                      </Chip.Label>
                    </Chip>
                  </div>
                  <p className="text-xs text-default-400 mt-2 italic">
                    Notice the different IDs - each useInject() creates a new
                    instance
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">
                  Request Scope (Simulated)
                </h3>
                <p className="text-default-500 mb-4 text-sm">
                  Instance shared within a single request context
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-32">
                      Request 1:
                    </span>
                    <Chip color="success" size="sm" variant="soft">
                      <Chip.Label>{requestService1.getRequestId()}</Chip.Label>
                    </Chip>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-32">
                      Request 2:
                    </span>
                    <Chip color="warning" size="sm" variant="soft">
                      <Chip.Label>{requestService2.getRequestId()}</Chip.Label>
                    </Chip>
                  </div>
                  <p className="text-xs text-default-400 mt-2 italic">
                    Each injection simulates a new request with unique ID
                  </p>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Lifecycle Management Section */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Lifecycle Management</h2>
            <p className="text-default-500">
              Services with initialization and cleanup hooks
            </p>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">
                OnModuleInit & OnModuleDestroy
              </h3>
              <p className="text-default-500 mb-4 text-sm">
                Lifecycle hooks called during service activation and
                deactivation
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold w-32">Status:</span>
                  <Chip
                    color={lifecycleStatus.initialized ? "success" : "warning"}
                    size="sm"
                    variant="soft"
                  >
                    <Chip.Label>
                      {lifecycleStatus.initialized
                        ? "Initialized"
                        : "Not Initialized"}
                    </Chip.Label>
                  </Chip>
                </div>

                {lifecycleStatus.resources.length > 0 && (
                  <div>
                    <span className="text-sm font-semibold block mb-2">
                      Initialized Resources:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {lifecycleStatus.resources.map((resource, index) => (
                        <Chip
                          color="success"
                          key={index}
                          size="sm"
                          variant="soft"
                        >
                          <Chip.Label>{resource}</Chip.Label>
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-default-100 p-3 rounded-lg text-xs">
                  <p className="font-semibold mb-1">Lifecycle Flow:</p>
                  <p className="text-default-600">
                    1. Constructor called → 2. onActivation hook → 3.
                    onModuleInit() → 4. Service ready → 5. onModuleDestroy() →
                    6. onDeactivation hook
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          {/* Advanced Patterns Section */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Advanced Patterns</h2>
            <p className="text-default-500">
              Complex dependency injection patterns and use cases
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Cache Service</h3>
                <p className="text-default-500 mb-4 text-sm">
                  Service with symbol-based token injection and TTL management
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-24">Size:</span>
                    <Chip size="sm" variant="soft">
                      <Chip.Label>
                        {cacheStats.size} / {cacheStats.maxSize}
                      </Chip.Label>
                    </Chip>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-24">TTL:</span>
                    <Chip size="sm" variant="soft">
                      <Chip.Label>{cacheStats.ttl}ms</Chip.Label>
                    </Chip>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button onPress={handleCacheSet} size="sm">
                      Set Value
                    </Button>
                    <Button
                      isDisabled={!cacheTestKey}
                      onPress={handleCacheGet}
                      size="sm"
                      variant="secondary"
                    >
                      Get Value
                    </Button>
                    <Button
                      onPress={handleCacheClear}
                      size="sm"
                      variant="danger"
                    >
                      Clear
                    </Button>
                  </div>

                  {cacheTestKey && (
                    <div className="mt-3 p-2 bg-default-100 rounded text-xs">
                      <p className="font-semibold">Last Key: {cacheTestKey}</p>
                      {cacheTestValue !== undefined && (
                        <p className="text-default-600">
                          Value: {cacheTestValue}
                        </p>
                      )}
                      {cacheTestValue === undefined && cacheTestKey && (
                        <p className="text-danger">
                          Value expired or not found
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Testable Service</h3>
                <p className="text-default-500 mb-4 text-sm">
                  Service designed for easy testing with dependency injection
                </p>
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onPress={handleFetchUser}
                    size="sm"
                  >
                    Fetch User Data
                  </Button>

                  {userData && (
                    <div className="p-2 bg-default-100 rounded text-xs">
                      <p className="font-semibold">User ID: {userData.id}</p>
                      <p className="text-default-600">Name: {userData.name}</p>
                      <Chip
                        className="mt-1"
                        color={userData.cached ? "success" : "warning"}
                        size="sm"
                        variant="soft"
                      >
                        <Chip.Label>
                          {userData.cached ? "From Cache" : "Fresh Data"}
                        </Chip.Label>
                      </Chip>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onPress={handleValidateEmail}
                    size="sm"
                    variant="secondary"
                  >
                    Validate Email
                  </Button>

                  {emailValidation && (
                    <div className="p-2 bg-default-100 rounded text-xs">
                      <p className="font-semibold">
                        Email: {emailValidation.email}
                      </p>
                      <Chip
                        className="mt-1"
                        color={emailValidation.valid ? "success" : "danger"}
                        size="sm"
                        variant="soft"
                      >
                        <Chip.Label>
                          {emailValidation.valid ? "Valid" : "Invalid"}
                        </Chip.Label>
                      </Chip>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          {/* Key Concepts Section */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Key Concepts</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h4 className="text-lg font-bold mb-2">Symbol Tokens</h4>
                <p className="text-xs text-default-500">
                  Use Symbol.for() for unique injection tokens to avoid naming
                  conflicts
                </p>
                <code className="text-xs bg-default-100 p-2 rounded block mt-2">
                  CACHE_CONFIG = Symbol.for()
                </code>
              </Card>

              <Card className="p-4">
                <h4 className="text-lg font-bold mb-2">Factory Providers</h4>
                <p className="text-xs text-default-500">
                  Create instances with custom logic using useFactory or
                  useAsyncFactory
                </p>
                <code className="text-xs bg-default-100 p-2 rounded block mt-2">
                  useAsyncFactory: async () =&gt; ...
                </code>
              </Card>

              <Card className="p-4">
                <h4 className="text-lg font-bold mb-2">Module Imports</h4>
                <p className="text-xs text-default-500">
                  Compose modules by importing other modules and their exported
                  providers
                </p>
                <code className="text-xs bg-default-100 p-2 rounded block mt-2">
                  imports: [CacheModule]
                </code>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
