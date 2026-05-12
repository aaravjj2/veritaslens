import { describe, expect, it, beforeEach } from "vitest";
import {
  isExtensionJwtConfigured,
  signExtensionJwt,
  verifyExtensionJwt,
} from "./extension-jwt";

describe("extension-jwt", () => {
  beforeEach(() => {
    process.env.EXTENSION_JWT_SECRET = "unit-test-jwt-secret-min-16-chars";
  });

  it("is configured when secret length >= 16", () => {
    expect(isExtensionJwtConfigured()).toBe(true);
  });

  it("roundtrips subject", async () => {
    const userId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
    const token = await signExtensionJwt(userId);
    const sub = await verifyExtensionJwt(token);
    expect(sub).toBe(userId);
  });

  it("rejects garbage token", async () => {
    expect(await verifyExtensionJwt("not.a.jwt")).toBeNull();
  });
});
