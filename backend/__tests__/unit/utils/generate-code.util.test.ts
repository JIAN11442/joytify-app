import crypto from "crypto";
import { ORIGIN_APP } from "../../../src/constants/env-validate.constant";
import { signToken, VerificationTokenSignOptions } from "../../../src/utils/jwt.util";
import {
  generateVerificationCode,
  generateVerificationLink,
} from "../../../src/utils/generate-code.util";

// Mock all external dependencies
jest.mock("crypto");
jest.mock("../../../src/utils/jwt.util");
jest.mock("../../../src/constants/env-validate.constant", () => ({
  ORIGIN_APP: "https://example.com",
}));

// Mock type definitions
const mockCrypto = crypto as jest.Mocked<typeof crypto>;
const mockSignToken = signToken as jest.MockedFunction<typeof signToken>;

// Mock Math.random
const mockMathRandom = jest.spyOn(Math, "random");

describe("Generate Code Util", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore Math.random
    mockMathRandom.mockRestore();
  });

  describe("generateVerificationCode", () => {
    it("should generate verification code with correct format", () => {
      // ==================== Arrange ====================
      // Mock crypto.getRandomValues to return specific value for letter
      const mockUint8Array = new Uint8Array([5]); // Should give us 'F' (65 + 5 = 70 = 'F')
      mockCrypto.getRandomValues = jest.fn().mockReturnValue(mockUint8Array);

      // Mock Math.random to return predictable numbers
      mockMathRandom
        .mockReturnValueOnce(0.1) // First digit: 1
        .mockReturnValueOnce(0.2) // Second digit: 2
        .mockReturnValueOnce(0.3) // Third digit: 3
        .mockReturnValueOnce(0.4) // Fourth digit: 4
        .mockReturnValueOnce(0.5) // Fifth digit: 5
        .mockReturnValueOnce(0.6); // Sixth digit: 6

      // ==================== Act ====================
      const result = generateVerificationCode();

      // ==================== Assert Process ====================
      // 1. verify crypto.getRandomValues was called
      expect(mockCrypto.getRandomValues).toHaveBeenCalledWith(expect.any(Uint8Array));

      // 2. verify code format (Letter-6digits)
      expect(result).toBe("F-123456");
      expect(result).toMatch(/^[A-Z]-\d{6}$/);
    });

    it("should generate different letters based on crypto values", () => {
      // ==================== Arrange ====================
      const testCases = [
        { cryptoValue: 0, expectedLetter: "A" },
        { cryptoValue: 25, expectedLetter: "Z" },
        { cryptoValue: 10, expectedLetter: "K" },
        { cryptoValue: 15, expectedLetter: "P" },
      ];

      // ==================== Act & Assert ====================
      testCases.forEach(({ cryptoValue, expectedLetter }) => {
        const mockUint8Array = new Uint8Array([cryptoValue]);
        mockCrypto.getRandomValues = jest.fn().mockReturnValue(mockUint8Array);

        // Mock consistent numbers for digits
        mockMathRandom
          .mockReturnValueOnce(0.1)
          .mockReturnValueOnce(0.2)
          .mockReturnValueOnce(0.3)
          .mockReturnValueOnce(0.4)
          .mockReturnValueOnce(0.5)
          .mockReturnValueOnce(0.6);

        const result = generateVerificationCode();

        expect(result).toBe(`${expectedLetter}-123456`);
        expect(result.charAt(0)).toBe(expectedLetter);
      });
    });

    it("should generate different number combinations", () => {
      // ==================== Arrange ====================
      const mockUint8Array = new Uint8Array([0]); // 'A'
      mockCrypto.getRandomValues = jest.fn().mockReturnValue(mockUint8Array);

      const testCases = [
        { randoms: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5], expected: "A-012345" },
        { randoms: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4], expected: "A-987654" },
        { randoms: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5], expected: "A-555555" },
      ];

      // ==================== Act & Assert ====================
      testCases.forEach(({ randoms, expected }) => {
        randoms.forEach((random) => mockMathRandom.mockReturnValueOnce(random));

        const result = generateVerificationCode();
        expect(result).toBe(expected);
      });
    });

    it("should handle crypto value modulo correctly", () => {
      // ==================== Arrange ====================
      // Test values that need modulo 26
      const testCases = [
        { cryptoValue: 26, expectedLetter: "A" }, // 26 % 26 = 0 -> A
        { cryptoValue: 27, expectedLetter: "B" }, // 27 % 26 = 1 -> B
        { cryptoValue: 51, expectedLetter: "Z" }, // 51 % 26 = 25 -> Z
        { cryptoValue: 255, expectedLetter: "Z" }, // 255 % 26 = 21 -> V, wait let me recalculate: 255 % 26 = 21 -> V
      ];

      // Fix the test case - 255 % 26 = 21, so 65 + 21 = 86 = 'V'
      const correctedTestCases = [
        { cryptoValue: 26, expectedLetter: "A" },
        { cryptoValue: 27, expectedLetter: "B" },
        { cryptoValue: 51, expectedLetter: "Z" }, // 51 % 26 = 25 -> Z
        { cryptoValue: 255, expectedLetter: "V" }, // 255 % 26 = 21 -> V
      ];

      // ==================== Act & Assert ====================
      correctedTestCases.forEach(({ cryptoValue, expectedLetter }) => {
        const mockUint8Array = new Uint8Array([cryptoValue]);
        mockCrypto.getRandomValues = jest.fn().mockReturnValue(mockUint8Array);

        mockMathRandom
          .mockReturnValueOnce(0.0)
          .mockReturnValueOnce(0.0)
          .mockReturnValueOnce(0.0)
          .mockReturnValueOnce(0.0)
          .mockReturnValueOnce(0.0)
          .mockReturnValueOnce(0.0);

        const result = generateVerificationCode();
        expect(result.charAt(0)).toBe(expectedLetter);
      });
    });

    it("should always generate 6-digit numbers", () => {
      // ==================== Arrange ====================
      const mockUint8Array = new Uint8Array([0]);
      mockCrypto.getRandomValues = jest.fn().mockReturnValue(mockUint8Array);

      // ==================== Act ====================
      // Generate multiple codes to test consistency
      for (let i = 0; i < 10; i++) {
        // Reset Math.random for each iteration
        mockMathRandom
          .mockReturnValueOnce(Math.random())
          .mockReturnValueOnce(Math.random())
          .mockReturnValueOnce(Math.random())
          .mockReturnValueOnce(Math.random())
          .mockReturnValueOnce(Math.random())
          .mockReturnValueOnce(Math.random());

        const result = generateVerificationCode();

        // ==================== Assert Process ====================
        expect(result).toMatch(/^[A-Z]-\d{6}$/);

        const numberPart = result.split("-")[1];
        expect(numberPart).toHaveLength(6);
        expect(numberPart).toMatch(/^\d{6}$/);
      }
    });

    it("should generate unique codes on multiple calls", () => {
      // ==================== Arrange ====================
      const codes = new Set();
      const iterations = 100;

      // ==================== Act ====================
      for (let i = 0; i < iterations; i++) {
        // Mock different crypto values
        const mockUint8Array = new Uint8Array([i % 256]);
        mockCrypto.getRandomValues = jest.fn().mockReturnValue(mockUint8Array);

        // Mock different random numbers
        for (let j = 0; j < 6; j++) {
          mockMathRandom.mockReturnValueOnce(Math.random());
        }

        const code = generateVerificationCode();
        codes.add(code);
      }

      // ==================== Assert Process ====================
      // We should have many unique codes (allowing for some collisions in random generation)
      expect(codes.size).toBeGreaterThan(iterations * 0.5);
    });
  });

  describe("generateVerificationLink", () => {
    const mockSessionId = "session-123";
    const mockToken = "mocked-jwt-token";

    it("should generate verification link with correct format", async () => {
      // ==================== Arrange ====================
      mockSignToken.mockReturnValue(mockToken);

      // ==================== Act ====================
      const result = await generateVerificationLink(mockSessionId);

      // ==================== Assert Process ====================
      // 1. verify signToken was called with correct parameters
      expect(mockSignToken).toHaveBeenCalledWith(
        { sessionId: mockSessionId },
        VerificationTokenSignOptions
      );

      // 2. verify URL format
      expect(result).toBe(`${ORIGIN_APP}/password/reset?token=${mockToken}`);
      expect(result).toContain(ORIGIN_APP);
      expect(result).toContain("/password/reset");
      expect(result).toContain(`token=${mockToken}`);
    });

    it("should handle different session IDs", async () => {
      // ==================== Arrange ====================
      const sessionIds = ["session-1", "session-abc-123", "user-session-456", "temp-session-xyz"];

      mockSignToken.mockReturnValue(mockToken);

      // ==================== Act & Assert ====================
      for (const sessionId of sessionIds) {
        const result = await generateVerificationLink(sessionId);

        expect(mockSignToken).toHaveBeenCalledWith({ sessionId }, VerificationTokenSignOptions);
        expect(result).toBe(`${ORIGIN_APP}/password/reset?token=${mockToken}`);
      }

      // ==================== Assert Process ====================
      expect(mockSignToken).toHaveBeenCalledTimes(sessionIds.length);
    });

    it("should handle different token values", async () => {
      // ==================== Arrange ====================
      const tokens = [
        "short-token",
        "very-long-jwt-token-with-lots-of-characters",
        "token.with.dots",
        "token_with_underscores",
      ];

      // ==================== Act & Assert ====================
      for (const token of tokens) {
        mockSignToken.mockReturnValue(token);

        const result = await generateVerificationLink(mockSessionId);

        expect(result).toBe(`${ORIGIN_APP}/password/reset?token=${token}`);
      }
    });

    it("should use correct ORIGIN_APP value", async () => {
      // ==================== Arrange ====================
      mockSignToken.mockReturnValue(mockToken);

      // ==================== Act ====================
      const result = await generateVerificationLink(mockSessionId);

      // ==================== Assert Process ====================
      expect(result.startsWith("https://example.com")).toBe(true);
      expect(result).toContain("https://example.com/password/reset?token=");
    });

    it("should handle special characters in session ID", async () => {
      // ==================== Arrange ====================
      const specialSessionIds = [
        "session@123",
        "session-with-spaces and-more",
        "session#with$special%characters",
        "session/with/slashes",
      ];

      mockSignToken.mockReturnValue(mockToken);

      // ==================== Act & Assert ====================
      for (const sessionId of specialSessionIds) {
        const result = await generateVerificationLink(sessionId);

        expect(mockSignToken).toHaveBeenCalledWith({ sessionId }, VerificationTokenSignOptions);
        expect(result).toContain(mockToken);
      }
    });

    it("should handle signToken errors", async () => {
      // ==================== Arrange ====================
      const mockError = new Error("Token signing failed");
      mockSignToken.mockImplementation(() => {
        throw mockError;
      });

      // ==================== Act & Assert ====================
      await expect(generateVerificationLink(mockSessionId)).rejects.toThrow("Token signing failed");

      // ==================== Assert Process ====================
      expect(mockSignToken).toHaveBeenCalledWith(
        { sessionId: mockSessionId },
        VerificationTokenSignOptions
      );
    });
  });

  describe("Integration scenarios", () => {
    it("should demonstrate typical password reset workflow", async () => {
      // ==================== Arrange ====================
      const userSessionId = "user-reset-session-123";
      const generatedToken = "reset-token-xyz";

      // Mock verification code generation
      const mockUint8Array = new Uint8Array([7]); // 'H'
      mockCrypto.getRandomValues = jest.fn().mockReturnValue(mockUint8Array);
      mockMathRandom
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.2)
        .mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.4)
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(0.9);

      // Mock link generation
      mockSignToken.mockReturnValue(generatedToken);

      // ==================== Act ====================
      const code = generateVerificationCode();
      const link = await generateVerificationLink(userSessionId);

      // ==================== Assert Process ====================
      // 1. verify code generation
      expect(code).toBe("H-123459");
      expect(code).toMatch(/^[A-Z]-\d{6}$/);

      // 2. verify link generation
      expect(link).toBe(`${ORIGIN_APP}/password/reset?token=${generatedToken}`);
      expect(mockSignToken).toHaveBeenCalledWith(
        { sessionId: userSessionId },
        VerificationTokenSignOptions
      );
    });
  });
});
