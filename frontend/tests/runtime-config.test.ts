import assert from "node:assert/strict";
import test from "node:test";
import { isDemoModeEnabled } from "../lib/runtime-config.ts";

const restoreEnv = (key: string, value: string | undefined) => {
  if (value === undefined) Reflect.deleteProperty(process.env, key);
  else Reflect.set(process.env, key, value);
};

test("demo mode is enabled explicitly in production", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDemoMode = process.env.ENABLE_DEMO_MODE;
  Reflect.set(process.env, "NODE_ENV", "production");
  Reflect.set(process.env, "ENABLE_DEMO_MODE", "true");
  assert.equal(isDemoModeEnabled(), true);
  restoreEnv("NODE_ENV", previousNodeEnv);
  restoreEnv("ENABLE_DEMO_MODE", previousDemoMode);
});

test("demo mode fails closed by default in production", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDemoMode = process.env.ENABLE_DEMO_MODE;
  Reflect.set(process.env, "NODE_ENV", "production");
  delete process.env.ENABLE_DEMO_MODE;
  assert.equal(isDemoModeEnabled(), false);
  restoreEnv("NODE_ENV", previousNodeEnv);
  restoreEnv("ENABLE_DEMO_MODE", previousDemoMode);
});
