import bcrypt from "bcrypt";
import { hashValue, compareHashValue } from "../../../src/utils/bcrypt.util";

// Mock bcrypt module
jest.mock("bcrypt");

// Mock type definitions
const mockBcrypt = bcrypt as any;

describe("Bcrypt Util", () => {
  const testPassword = "mySecretPassword123";
  const mockHashedPassword = "$2b$10$MockedHashedPasswordValue";

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("hashValue", () => {
    it("should hash password with default salt rounds", async () => {
      // ==================== Arrange ====================
      mockBcrypt.hash.mockResolvedValue(mockHashedPassword);

      // ==================== Act ====================
      const result = await hashValue(testPassword);

      // ==================== Assert Process ====================
      // 1. verify bcrypt.hash was called with correct parameters
      expect(mockBcrypt.hash).toHaveBeenCalledWith(testPassword, 10);
      expect(mockBcrypt.hash).toHaveBeenCalledTimes(1);

      // 2. verify correct result
      expect(result).toBe(mockHashedPassword);
    });

    it("should hash password with custom salt rounds", async () => {
      // ==================== Arrange ====================
      const customSaltRounds = 12;
      mockBcrypt.hash.mockResolvedValue(mockHashedPassword);

      // ==================== Act ====================
      const result = await hashValue(testPassword, customSaltRounds);

      // ==================== Assert Process ====================
      // 1. verify bcrypt.hash was called with custom salt rounds
      expect(mockBcrypt.hash).toHaveBeenCalledWith(testPassword, customSaltRounds);
      expect(mockBcrypt.hash).toHaveBeenCalledTimes(1);

      // 2. verify correct result
      expect(result).toBe(mockHashedPassword);
    });

    it("should handle different password types", async () => {
      // ==================== Arrange ====================
      const testPasswords = [
        "simple",
        "ComplexP@ssw0rd!",
        "1234567890",
        "Special!@#$%^&*()",
        "中文密码",
        "emojis🔐🛡️",
        "",
      ];

      mockBcrypt.hash.mockResolvedValue(mockHashedPassword);

      // ==================== Act & Assert ====================
      for (const password of testPasswords) {
        const result = await hashValue(password);

        expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10);
        expect(result).toBe(mockHashedPassword);
      }

      // ==================== Assert Process ====================
      expect(mockBcrypt.hash).toHaveBeenCalledTimes(testPasswords.length);
    });

    it("should handle bcrypt hash errors", async () => {
      // ==================== Arrange ====================
      const mockError = new Error("Bcrypt hash failed");
      mockBcrypt.hash.mockRejectedValue(mockError);

      // ==================== Act & Assert ====================
      await expect(hashValue(testPassword)).rejects.toThrow("Bcrypt hash failed");

      // ==================== Assert Process ====================
      expect(mockBcrypt.hash).toHaveBeenCalledWith(testPassword, 10);
    });

    it("should work with different salt round values", async () => {
      // ==================== Arrange ====================
      const saltRounds = [8, 10, 12, 14];
      mockBcrypt.hash.mockResolvedValue(mockHashedPassword);

      // ==================== Act & Assert ====================
      for (const rounds of saltRounds) {
        const result = await hashValue(testPassword, rounds);

        expect(mockBcrypt.hash).toHaveBeenCalledWith(testPassword, rounds);
        expect(result).toBe(mockHashedPassword);
      }

      // ==================== Assert Process ====================
      expect(mockBcrypt.hash).toHaveBeenCalledTimes(saltRounds.length);
    });
  });

  describe("compareHashValue", () => {
    it("should return true when password matches hash", async () => {
      // ==================== Arrange ====================
      mockBcrypt.compare.mockResolvedValue(true);

      // ==================== Act ====================
      const result = await compareHashValue(testPassword, mockHashedPassword);

      // ==================== Assert Process ====================
      // 1. verify bcrypt.compare was called with correct parameters
      expect(mockBcrypt.compare).toHaveBeenCalledWith(testPassword, mockHashedPassword);
      expect(mockBcrypt.compare).toHaveBeenCalledTimes(1);

      // 2. verify correct result
      expect(result).toBe(true);
    });

    it("should return false when password does not match hash", async () => {
      // ==================== Arrange ====================
      const wrongPassword = "wrongPassword";
      mockBcrypt.compare.mockResolvedValue(false);

      // ==================== Act ====================
      const result = await compareHashValue(wrongPassword, mockHashedPassword);

      // ==================== Assert Process ====================
      // 1. verify bcrypt.compare was called
      expect(mockBcrypt.compare).toHaveBeenCalledWith(wrongPassword, mockHashedPassword);

      // 2. verify correct result
      expect(result).toBe(false);
    });

    it("should return false when bcrypt compare throws error", async () => {
      // ==================== Arrange ====================
      const mockError = new Error("Bcrypt compare failed");
      mockBcrypt.compare.mockRejectedValue(mockError);

      // ==================== Act ====================
      const result = await compareHashValue(testPassword, mockHashedPassword);

      // ==================== Assert Process ====================
      // 1. verify bcrypt.compare was called
      expect(mockBcrypt.compare).toHaveBeenCalledWith(testPassword, mockHashedPassword);

      // 2. verify error was caught and false returned
      expect(result).toBe(false);
    });

    it("should handle various error scenarios gracefully", async () => {
      // ==================== Arrange ====================
      const errorTypes = [
        new Error("Network error"),
        new TypeError("Type error"),
        new RangeError("Range error"),
        "String error",
        null,
        undefined,
      ];

      // ==================== Act & Assert ====================
      for (const error of errorTypes) {
        mockBcrypt.compare.mockRejectedValue(error);

        const result = await compareHashValue(testPassword, mockHashedPassword);
        expect(result).toBe(false);
      }

      // ==================== Assert Process ====================
      expect(mockBcrypt.compare).toHaveBeenCalledTimes(errorTypes.length);
    });

    it("should work with different password and hash combinations", async () => {
      // ==================== Arrange ====================
      const testCases = [
        { password: "password1", hash: "$2b$10$hash1", expected: true },
        { password: "password2", hash: "$2b$10$hash2", expected: false },
        { password: "", hash: "$2b$10$emptyHash", expected: true },
        { password: "ComplexP@ss!", hash: "$2b$12$complexHash", expected: false },
      ];

      // ==================== Act & Assert ====================
      for (const { password, hash, expected } of testCases) {
        mockBcrypt.compare.mockResolvedValue(expected);

        const result = await compareHashValue(password, hash);

        expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hash);
        expect(result).toBe(expected);
      }

      // ==================== Assert Process ====================
      expect(mockBcrypt.compare).toHaveBeenCalledTimes(testCases.length);
    });

    it("should handle edge cases for password comparison", async () => {
      // ==================== Arrange ====================
      const edgeCases = [
        { password: "", hash: "" },
        { password: " ", hash: "$2b$10$space" },
        { password: "\n\t", hash: "$2b$10$whitespace" },
        { password: "🔐🛡️", hash: "$2b$10$emoji" },
      ];

      mockBcrypt.compare.mockResolvedValue(true);

      // ==================== Act & Assert ====================
      for (const { password, hash } of edgeCases) {
        const result = await compareHashValue(password, hash);

        expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hash);
        expect(result).toBe(true);
      }

      // ==================== Assert Process ====================
      expect(mockBcrypt.compare).toHaveBeenCalledTimes(edgeCases.length);
    });
  });

  describe("Integration scenarios", () => {
    it("should demonstrate typical hash and compare workflow", async () => {
      // ==================== Arrange ====================
      const originalPassword = "userPassword123";
      const hashedResult = "$2b$10$hashedUserPassword";

      // Mock hash operation
      mockBcrypt.hash.mockResolvedValue(hashedResult);

      // Mock successful comparison
      mockBcrypt.compare.mockResolvedValue(true);

      // ==================== Act ====================
      // 1. Hash the password
      const hash = await hashValue(originalPassword);

      // 2. Compare the password with hash
      const isValid = await compareHashValue(originalPassword, hash);

      // ==================== Assert Process ====================
      // 1. verify hash operation
      expect(mockBcrypt.hash).toHaveBeenCalledWith(originalPassword, 10);
      expect(hash).toBe(hashedResult);

      // 2. verify compare operation
      expect(mockBcrypt.compare).toHaveBeenCalledWith(originalPassword, hashedResult);
      expect(isValid).toBe(true);
    });

    it("should handle failed login attempt workflow", async () => {
      // ==================== Arrange ====================
      const correctPassword = "userPassword123";
      const wrongPassword = "wrongPassword";
      const storedHash = "$2b$10$storedHashValue";

      mockBcrypt.compare.mockResolvedValue(false);

      // ==================== Act ====================
      const isValid = await compareHashValue(wrongPassword, storedHash);

      // ==================== Assert Process ====================
      expect(mockBcrypt.compare).toHaveBeenCalledWith(wrongPassword, storedHash);
      expect(isValid).toBe(false);
    });
  });
});
