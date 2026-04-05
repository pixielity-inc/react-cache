import { beforeEach, afterEach, vi } from "vitest";

vi.mock("@abdokouta/react-di", () => ({
  Injectable: () => (target: any) => target,
  Inject: () => (_target: any, _propertyKey: string, _parameterIndex: number) => {},
  Module: () => (target: any) => target,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetAllMocks();
});
