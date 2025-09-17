import { Response } from "express";
import {
  setAuthCookies,
  setUnauthorizedCookies,
  setVerificationCookies,
  setUserPreferenceCookie,
  clearAuthCookies,
  clearUnauthorizedCookies,
  clearVerificationCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  getUnauthorizedCookieOptions,
  getVerificationCookieOptions,
  getUserPreferenceCookieOptions,
  refreshCookiePath,
} from "../../../src/utils/cookies.util";
import {
  fifteenMinutesFromNow,
  oneDayFromNow,
  tenMinutesFromNow,
  thirtyDaysFormNow,
} from "../../../src/utils/date.util";

// Mock date utilities
jest.mock("../../../src/utils/date.util");

// Mock environment variables
jest.mock("../../../src/constants/env-validate.constant", () => ({
  NODE_ENV: "development", // Default to development for most tests
}));

const mockFifteenMinutesFromNow = fifteenMinutesFromNow as jest.MockedFunction<
  typeof fifteenMinutesFromNow
>;
const mockOneDayFromNow = oneDayFromNow as jest.MockedFunction<typeof oneDayFromNow>;
const mockTenMinutesFromNow = tenMinutesFromNow as jest.MockedFunction<typeof tenMinutesFromNow>;
const mockThirtyDaysFormNow = thirtyDaysFormNow as jest.MockedFunction<typeof thirtyDaysFormNow>;

describe("Cookies Util", () => {
  let mockRes: jest.Mocked<Response>;

  // ==================== Arrange ====================
  // prepare fixed date times for testing to ensure predictable test results
  const mockDate15Min = new Date("2024-01-01T12:15:00Z");
  const mockDate1Day = new Date("2024-01-02T12:00:00Z");
  const mockDate10Min = new Date("2024-01-01T12:10:00Z");
  const mockDate30Days = new Date("2024-01-31T12:00:00Z");

  beforeEach(() => {
    // ==================== Arrange ====================
    // clear all mock states
    jest.clearAllMocks();

    // set return values for date utility functions
    mockFifteenMinutesFromNow.mockReturnValue(mockDate15Min);
    mockOneDayFromNow.mockReturnValue(mockDate1Day);
    mockTenMinutesFromNow.mockReturnValue(mockDate10Min);
    mockThirtyDaysFormNow.mockReturnValue(mockDate30Days);

    // create mock Response object
    mockRes = {
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    } as any;
  });

  describe("Cookie Options Functions", () => {
    it("should return correct access token cookie options", () => {
      // ==================== Act ====================
      // call getAccessTokenCookieOptions function
      const options = getAccessTokenCookieOptions();

      // ==================== Assert ====================
      // verify returned options contain correct security settings and expiration time
      expect(options).toEqual({
        sameSite: "lax", // development environment (NODE_ENV === "development")
        httpOnly: false, // development environment
        secure: false, // development environment
        expires: mockDate15Min,
      });
      // verify date utility function is called correctly
      expect(mockFifteenMinutesFromNow).toHaveBeenCalledTimes(1);
    });

    it("should return correct refresh token cookie options", () => {
      // ==================== Act ====================
      // call getRefreshTokenCookieOptions function
      const options = getRefreshTokenCookieOptions();

      // ==================== Assert ====================
      // verify returned options contain correct security settings, expiration time and path
      expect(options).toEqual({
        sameSite: "lax",
        httpOnly: false,
        secure: false,
        expires: mockDate30Days,
        path: "/auth/refresh",
      });
      // verify date utility function is called correctly
      expect(mockThirtyDaysFormNow).toHaveBeenCalledTimes(1);
    });

    it("should return correct unauthorized cookie options", () => {
      // ==================== Act ====================
      // call getUnauthorizedCookieOptions function
      const options = getUnauthorizedCookieOptions();

      // ==================== Assert ====================
      // verify returned options contain correct security settings and expiration time
      expect(options).toEqual({
        sameSite: "lax",
        httpOnly: false,
        secure: false,
        expires: mockDate1Day,
      });
    });

    it("should return correct verification cookie options", () => {
      // ==================== Act ====================
      // call getVerificationCookieOptions function
      const options = getVerificationCookieOptions();

      // ==================== Assert ====================
      // verify returned options contain correct security settings and expiration time
      expect(options).toEqual({
        sameSite: "lax",
        httpOnly: false,
        secure: false,
        expires: mockDate10Min,
      });
    });

    it("should return correct user preference cookie options", () => {
      // ==================== Act ====================
      // call getUserPreferenceCookieOptions function
      const options = getUserPreferenceCookieOptions();

      // ==================== Assert ====================
      // verify returned options contain correct security settings and expiration time
      expect(options).toEqual({
        sameSite: "lax",
        httpOnly: false,
        secure: false,
        expires: mockDate30Days,
      });
    });
  });

  describe("Set Cookies Functions", () => {
    it("should set all auth cookies and clear unauthorized cookies", () => {
      // ==================== Arrange ====================
      // prepare authentication parameters including access token, refresh token and user preferences
      const authParams = {
        res: mockRes,
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
        ui_prefs: '{"theme":"dark"}',
      };

      // ==================== Act ====================
      // call setAuthCookies function to set authentication cookies
      const result = setAuthCookies(authParams);

      // ==================== Assert ====================
      // verify unauthorized cookie is cleared first
      expect(mockRes.clearCookie).toHaveBeenCalledWith("unauthorized");
      // verify access token cookie is set
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "accessToken",
        "access-token-123",
        expect.objectContaining({
          expires: mockDate15Min,
        })
      );
      // verify refresh token cookie is set
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh-token-456",
        expect.objectContaining({
          expires: mockDate30Days,
          path: "/auth/refresh",
        })
      );
      // verify user preference cookie is set
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "ui_prefs",
        '{"theme":"dark"}',
        expect.objectContaining({
          expires: mockDate30Days,
        })
      );

      // verify response object is returned
      expect(result).toBe(mockRes);
      // verify total of 3 cookie sets and 1 clear operation
      expect(mockRes.cookie).toHaveBeenCalledTimes(3);
      expect(mockRes.clearCookie).toHaveBeenCalledTimes(1);
    });

    it("should set unauthorized cookie", () => {
      // ==================== Arrange ====================
      // prepare parameters for setting unauthorized cookie

      // ==================== Act ====================
      // call setUnauthorizedCookies function
      const result = setUnauthorizedCookies({ res: mockRes, redirectUrl: "/dashboard" });

      // ==================== Assert ====================
      // verify unauthorized cookie is set with redirect URL
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "unauthorized",
        "/dashboard",
        expect.objectContaining({
          expires: mockDate1Day,
        })
      );
      // verify response object is returned
      expect(result).toBe(mockRes);
    });

    it("should set verification cookie", () => {
      // ==================== Arrange ====================
      // prepare parameters for setting verification cookie

      // ==================== Act ====================
      // call setVerificationCookies function
      const result = setVerificationCookies({ res: mockRes, sessionToken: "session-123" });

      // ==================== Assert ====================
      // verify verification token cookie is set
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "vrfctToken",
        "session-123",
        expect.objectContaining({
          expires: mockDate10Min,
        })
      );
      // verify response object is returned
      expect(result).toBe(mockRes);
    });

    it("should set user preference cookie", () => {
      // ==================== Arrange ====================
      // prepare parameters for setting user preference cookie

      // ==================== Act ====================
      // call setUserPreferenceCookie function
      const result = setUserPreferenceCookie({ res: mockRes, ui_prefs: '{"lang":"en"}' });

      // ==================== Assert ====================
      // verify user preference cookie is set
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "ui_prefs",
        '{"lang":"en"}',
        expect.objectContaining({
          expires: mockDate30Days,
        })
      );
      // verify response object is returned
      expect(result).toBe(mockRes);
    });
  });

  describe("Clear Cookies Functions", () => {
    it("should clear all auth cookies", () => {
      // ==================== Act ====================
      // call clearAuthCookies function to clear all authentication cookies
      const result = clearAuthCookies(mockRes);

      // ==================== Assert ====================
      // verify access token cookie is cleared
      expect(mockRes.clearCookie).toHaveBeenCalledWith("accessToken");
      // verify refresh token cookie is cleared (with path)
      expect(mockRes.clearCookie).toHaveBeenCalledWith("refreshToken", {
        path: "/auth/refresh",
      });
      // verify user preference cookie is cleared
      expect(mockRes.clearCookie).toHaveBeenCalledWith("ui_prefs");

      // verify response object is returned
      expect(result).toBe(mockRes);
      // verify total of 3 clear operations
      expect(mockRes.clearCookie).toHaveBeenCalledTimes(3);
    });

    it("should clear unauthorized cookie", () => {
      // ==================== Act ====================
      // call clearUnauthorizedCookies function
      const result = clearUnauthorizedCookies(mockRes);

      // ==================== Assert ====================
      // verify unauthorized cookie is cleared
      expect(mockRes.clearCookie).toHaveBeenCalledWith("unauthorized");
      // verify response object is returned
      expect(result).toBe(mockRes);
    });

    it("should clear verification cookie", () => {
      // ==================== Act ====================
      // call clearVerificationCookies function
      const result = clearVerificationCookies(mockRes);

      // ==================== Assert ====================
      // verify verification token cookie is cleared
      expect(mockRes.clearCookie).toHaveBeenCalledWith("vrfctToken");
      // verify response object is returned
      expect(result).toBe(mockRes);
    });
  });

  describe("Integration scenarios", () => {
    it("should handle authentication flow", () => {
      // ==================== Arrange & Act ====================
      // simulate login flow: set authentication cookies
      setAuthCookies({
        res: mockRes,
        accessToken: "jwt-access",
        refreshToken: "jwt-refresh",
        ui_prefs: '{"theme":"dark"}',
      });

      // ==================== Assert ====================
      // verify unauthorized cookie is cleared during login
      expect(mockRes.clearCookie).toHaveBeenCalledWith("unauthorized");
      // verify 3 cookies are set
      expect(mockRes.cookie).toHaveBeenCalledTimes(3);

      // ==================== Arrange ====================
      // clear mock state to prepare for logout test
      jest.clearAllMocks();

      // ==================== Act ====================
      // simulate logout flow: clear authentication cookies
      clearAuthCookies(mockRes);

      // ==================== Assert ====================
      // verify 3 cookies are cleared during logout
      expect(mockRes.clearCookie).toHaveBeenCalledTimes(3);
    });

    it("should handle password reset flow", () => {
      // ==================== Arrange & Act ====================
      // simulate password reset flow: set verification cookie
      setVerificationCookies({ res: mockRes, sessionToken: "reset-session" });

      // ==================== Assert ====================
      // verify verification token cookie is set
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "vrfctToken",
        "reset-session",
        expect.objectContaining({
          expires: mockDate10Min,
        })
      );

      // ==================== Arrange ====================
      // clear mock state to prepare for clear test
      jest.clearAllMocks();

      // ==================== Act ====================
      // clear verification cookie
      clearVerificationCookies(mockRes);

      // ==================== Assert ====================
      // verify verification token cookie is cleared
      expect(mockRes.clearCookie).toHaveBeenCalledWith("vrfctToken");
    });

    it("should handle unauthorized access", () => {
      // ==================== Arrange & Act ====================
      // simulate unauthorized access: set unauthorized cookie
      setUnauthorizedCookies({ res: mockRes, redirectUrl: "/protected" });

      // ==================== Assert ====================
      // verify unauthorized cookie is set with redirect URL
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "unauthorized",
        "/protected",
        expect.objectContaining({
          expires: mockDate1Day,
        })
      );
    });
  });

  describe("refreshCookiePath", () => {
    it("should have correct path in development environment", () => {
      // ==================== Act & Assert ====================
      // verify refresh cookie path is set correctly for development
      expect(refreshCookiePath).toBe("/auth/refresh");
    });

    it("should have correct path in production environment", () => {
      // ==================== Arrange ====================
      // Mock production environment by temporarily overriding the module
      const originalEnv = require("../../../src/constants/env-validate.constant");
      jest.doMock("../../../src/constants/env-validate.constant", () => ({
        ...originalEnv,
        NODE_ENV: "production",
      }));

      // Clear module cache and re-import
      jest.resetModules();
      const {
        refreshCookiePath: prodRefreshCookiePath,
      } = require("../../../src/utils/cookies.util");

      // ==================== Act & Assert ====================
      // verify refresh cookie path is set correctly for production
      expect(prodRefreshCookiePath).toBe("/api/v1/auth/refresh");

      // ==================== Cleanup ====================
      // Restore original module
      jest.resetModules();
    });
  });

  describe("Cookie value handling", () => {
    it("should handle various ui_prefs formats", () => {
      // ==================== Arrange ====================
      // prepare various formats of user preference strings
      const prefFormats = [
        '{"theme":"dark"}',
        '{"lang":"en","theme":"light"}',
        "{}",
        '{"special":"char\\nacters"}',
      ];

      // ==================== Act & Assert ====================
      // test setting user preference cookie for each format
      prefFormats.forEach((prefs) => {
        jest.clearAllMocks();
        setUserPreferenceCookie({ res: mockRes, ui_prefs: prefs });
        expect(mockRes.cookie).toHaveBeenCalledWith("ui_prefs", prefs, expect.any(Object));
      });
    });

    it("should handle various token formats", () => {
      // ==================== Arrange ====================
      // prepare various formats of token strings
      const tokens = [
        "short-token",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        "token_with_underscores",
      ];

      // ==================== Act & Assert ====================
      // test setting verification cookie for each format
      tokens.forEach((token) => {
        jest.clearAllMocks();
        setVerificationCookies({ res: mockRes, sessionToken: token });
        expect(mockRes.cookie).toHaveBeenCalledWith("vrfctToken", token, expect.any(Object));
      });
    });
  });
});
