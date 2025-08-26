import jwt from "jsonwebtoken";
import { describe } from "@jest/globals";
import { AudioVolumeType, LoopModeType, SupportedLocaleType } from "@joytify/shared-types/types";
import {
  AccessTokenPayload,
  AccessTokenSignOptions,
  RefreshTokenPayload,
  RefreshTokenSignOptions,
  signToken,
  UserPreferenceSignOptions,
  UserPreferenceTokenPayload,
  VerificationTokenPayload,
  VerificationTokenSignOptions,
  verifyToken,
} from "../../../src/utils/jwt.util";

describe("JWT Utilities", () => {
  // ==================== Arrange ====================
  // prepare mock data for various JWT payloads for testing
  const mockAccessPayload: AccessTokenPayload = {
    sessionId: "session123",
    userId: "user123",
    firebaseUserId: "firebase123",
  };

  const mockRefreshPayload: RefreshTokenPayload = {
    sessionId: "session123",
  };

  const mockUserPreferencePayload: UserPreferenceTokenPayload = {
    sidebarCollapsed: false,
    locale: "en-US" as SupportedLocaleType,
    player: {
      shuffle: false,
      loop: "none" as LoopModeType,
      volume: 0.8 as AudioVolumeType,
      playbackQueue: { queue: [], currentIndex: 0 },
    },
  };

  const mockVerificationPayload: VerificationTokenPayload = {
    sessionId: "session123",
  };

  describe("signToken", () => {
    it.each([
      [
        "AccessToken",
        mockAccessPayload,
        AccessTokenSignOptions,
        (decoded: any, mock: any) => {
          expect(decoded.userId).toBe(mock.userId);
          expect(decoded.sessionId).toBe(mock.sessionId);
          expect(decoded.firebaseUserId).toBe(mock.firebaseUserId);
        },
      ],
      [
        "RefreshToken",
        mockRefreshPayload,
        RefreshTokenSignOptions,
        (decoded: any, mock: any) => {
          expect(decoded.sessionId).toBe(mock.sessionId);
        },
      ],
      [
        "UserPreference",
        mockUserPreferencePayload,
        UserPreferenceSignOptions,
        (decoded: any, mock: any) => {
          expect(decoded.sidebarCollapsed).toBe(mock.sidebarCollapsed);
          expect(decoded.locale).toBe(mock.locale);
          expect(decoded.player).toEqual(mock.player);
        },
      ],
      [
        "Verification",
        mockVerificationPayload,
        VerificationTokenSignOptions,
        (decoded: any, mock: any) => {
          expect(decoded.sessionId).toBe(mock.sessionId);
        },
      ],
    ])(
      "should generate valid JWT token for %s payload type",
      (name, payload, options, validateContent) => {
        // ==================== Act ====================
        // use signToken function to generate JWT token
        const token = signToken(payload, options);

        // ==================== Assert ====================
        // verify the generated token is a string
        expect(typeof token).toBe("string");
        // verify the token contains three parts (header.payload.signature)
        expect(token.split(".")).toHaveLength(3);

        // decode the token and verify content
        const decoded = jwt.decode(token) as any;
        validateContent?.(decoded, payload);
        // verify the audience field is correctly set to ["user"]
        expect(decoded.aud).toEqual(["user"]);
      }
    );

    it.each([
      ["AccessToken", mockAccessPayload, AccessTokenSignOptions, 15 * 60], // 15m
      ["RefreshToken", mockRefreshPayload, RefreshTokenSignOptions, 30 * 24 * 60 * 60], // 30d
      ["UserPreference", mockUserPreferencePayload, UserPreferenceSignOptions, 30 * 24 * 60 * 60], // 30d
      ["Verification", mockVerificationPayload, VerificationTokenSignOptions, 10 * 60], // 10m
    ])(
      "should generate valid JWT token with correct expiration time for %s payload type (±1min tolerance)",
      (name, payload, options, expiresIn) => {
        // ==================== Act ====================
        // use signToken function to generate JWT token
        const token = signToken(payload, options);

        // ==================== Assert ====================
        // decode the token to get expiration time
        const decoded = jwt.decode(token) as any;
        const now = Date.now() / 1000;
        // calculate expected expiration time range (allow ±1 minute tolerance)
        const minExpectedExp = now + (expiresIn - 1 * 60);
        const maxExpectedExp = now + (expiresIn + 1 * 60);

        // verify expiration time is within expected range
        expect(decoded.exp).toBeGreaterThan(minExpectedExp);
        expect(decoded.exp).toBeLessThan(maxExpectedExp);
      }
    );
  });

  describe("verifyToken", () => {
    it.each([
      ["AccessToken", mockAccessPayload, AccessTokenSignOptions, 15 * 60], // 15m
      ["RefreshToken", mockRefreshPayload, RefreshTokenSignOptions, 30 * 24 * 60 * 60], // 30d
      ["UserPreference", mockUserPreferencePayload, UserPreferenceSignOptions, 30 * 24 * 60 * 60], // 30d
      ["Verification", mockVerificationPayload, VerificationTokenSignOptions, 10 * 60], // 10m
    ])(
      "should verify a valid JWT token for %s payload type",
      async (name, payload, options, expiresIn) => {
        // ==================== Arrange ====================
        // first generate a valid JWT token
        const token = signToken(payload, options);

        // ==================== Act ====================
        // use verifyToken function to verify the token
        const decoded = await verifyToken(token, options);

        // ==================== Assert ====================
        const now = Date.now() / 1000;
        // calculate expected expiration time range (allow ±1 minute tolerance)
        const minExpectedExp = now + (expiresIn - 1 * 60);
        const maxExpectedExp = now + (expiresIn + 1 * 60);

        // verify no error is returned
        expect(decoded.error).toBeUndefined();
        // verify payload exists
        expect(decoded.payload).toBeDefined();

        // only validate payload content, not JWT other properties, use toMatchObject
        expect(decoded.payload).toMatchObject(payload);

        // verify audience and expiration time
        expect((decoded.payload as any).aud).toEqual(["user"]);
        expect((decoded.payload as any).exp).toBeGreaterThan(minExpectedExp);
        expect((decoded.payload as any).exp).toBeLessThan(maxExpectedExp);
      }
    );

    it("should return error for invalid token", async () => {
      // ==================== Arrange ====================
      // prepare an invalid token string
      const invalidToken = "invalid.token.here";

      // ==================== Act ====================
      // attempt to verify invalid token
      const result = await verifyToken(invalidToken, {
        secret: AccessTokenSignOptions.secret,
      });

      // ==================== Assert ====================
      // verify an error is returned
      expect(result.error).toBeDefined();
      // verify no payload is returned
      expect(result.payload).toBeUndefined();
    });

    it("should return error for token with wrong secret", async () => {
      // ==================== Arrange ====================
      // generate token with correct secret
      const token = signToken(mockAccessPayload, AccessTokenSignOptions);

      // ==================== Act ====================
      // attempt to verify token with wrong secret
      const result = await verifyToken(token, {
        secret: "wrong-secret",
      });

      // ==================== Assert ====================
      // verify an error is returned
      expect(result.error).toBeDefined();
      // verify no payload is returned
      expect(result.payload).toBeUndefined();
    });

    it("should handle undefined token", async () => {
      // ==================== Arrange ====================
      // prepare undefined token

      // ==================== Act ====================
      // attempt to verify undefined token
      const result = await verifyToken(undefined, {
        secret: AccessTokenSignOptions.secret,
      });

      // ==================== Assert ====================
      // verify no error is returned (undefined token is considered valid)
      expect(result.error).toBeUndefined();
      // verify no payload is returned
      expect(result.payload).toBeUndefined();
    });

    it("should handle expired token", async () => {
      // ==================== Arrange ====================
      // create token options that expire in 1 second
      const expiredOptions = {
        ...AccessTokenSignOptions,
        expiresIn: 1, // 1 second to make it expired
      };

      // generate expired token
      const expiredToken = signToken(mockAccessPayload, expiredOptions);

      // ==================== Act ====================
      // wait 2 seconds to ensure token is expired
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // attempt to verify expired token
      const result = await verifyToken(expiredToken, {
        secret: AccessTokenSignOptions.secret,
      });

      // ==================== Assert ====================
      // verify an error is returned
      expect(result.error).toBeDefined();
      // verify error message contains "expired" keyword
      expect(result.error).toContain("expired");
    });
  });
});
