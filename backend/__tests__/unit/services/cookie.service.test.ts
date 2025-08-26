import _ from "lodash";
import UserModel from "../../../src/models/user.model";
import {
  getVerifiedUserPreferencesCookie,
  updateUserPreferencesCookie,
} from "../../../src/services/cookie.service";
import { signToken, UserPreferenceSignOptions, verifyToken } from "../../../src/utils/jwt.util";
import appAssert from "../../../src/utils/app-assert.util";

// Mock all external dependencies
jest.mock("lodash");
jest.mock("../../../src/models/user.model");
jest.mock("../../../src/utils/jwt.util");
jest.mock("../../../src/utils/app-assert.util");

// Mock type definitions
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;
const mockSignToken = signToken as jest.MockedFunction<typeof signToken>;
const mockAppAssert = appAssert as jest.MockedFunction<typeof appAssert>;
const mockLodashOmit = _.omit as jest.MockedFunction<typeof _.omit>;

describe("Cookie Service", () => {
  // Mock data constants
  const mockUserId = "user-id-123";
  const mockCookie = "mock-jwt-cookie-token";
  const mockNewCookie = "new-jwt-cookie-token";

  const mockUserPreferences = {
    language: "en-US",
    theme: "dark",
    autoplay: true,
    volume: 80,
  };

  const mockTokenPayload = {
    userId: mockUserId,
    ...mockUserPreferences,
    iat: 1234567890,
    exp: 1234567999,
    aud: "joytify-app",
  };

  const mockUser = {
    _id: mockUserId,
    email: "test@example.com",
    userPreferences: mockUserPreferences,
  };

  // Common test parameters
  const verifyParams = {
    cookie: mockCookie,
    strict: false,
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock appAssert to throw error when condition is false
    mockAppAssert.mockImplementation((condition, _statusCode, message) => {
      if (!condition) {
        throw new Error(message);
      }
    });

    // Setup common mock returns
    mockVerifyToken.mockResolvedValue({ payload: mockTokenPayload } as any);
    mockLodashOmit.mockReturnValue(mockUserPreferences as any);
    mockSignToken.mockReturnValue(mockNewCookie);
    mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUser as any);
  });

  describe("getVerifiedUserPreferencesCookie", () => {
    it("should verify user preferences cookie successfully", async () => {
      // ==================== Arrange ====================
      // 使用集中管理的通用參數

      // ==================== Act ====================
      // 1. verify user preferences cookie
      const result = await getVerifiedUserPreferencesCookie(verifyParams);

      // ==================== Assert Process ====================
      // 1. verify token verification was called
      expect(mockVerifyToken).toHaveBeenCalledWith(mockCookie, {
        secret: UserPreferenceSignOptions.secret,
      });

      // 2. verify payload assertion
      expect(mockAppAssert).toHaveBeenCalledWith(
        mockTokenPayload,
        401,
        "User preferences cookie is invalid"
      );

      // 3. verify correct result
      expect(result).toEqual({
        payload: mockTokenPayload,
      });
    });

    it("should return null when cookie not provided and strict is false", async () => {
      // ==================== Arrange ====================
      // 1. setup no cookie with non-strict mode
      const verifyParams = {
        cookie: "",
        strict: false,
      };

      // ==================== Act ====================
      // 1. verify with empty cookie in non-strict mode
      const result = await getVerifiedUserPreferencesCookie(verifyParams);

      // ==================== Assert Process ====================
      // 1. verify token verification was not called
      expect(mockVerifyToken).not.toHaveBeenCalled();

      // 2. verify appAssert was not called for cookie check
      expect(mockAppAssert).not.toHaveBeenCalled();

      // 3. verify null payload result
      expect(result).toEqual({
        payload: null,
      });
    });

    it("should return null when cookie is undefined and strict is false", async () => {
      // ==================== Arrange ====================
      // 1. setup undefined cookie with non-strict mode
      const verifyParams = {
        cookie: undefined as any,
        strict: false,
      };

      // ==================== Act ====================
      // 1. verify with undefined cookie in non-strict mode
      const result = await getVerifiedUserPreferencesCookie(verifyParams);

      // ==================== Assert Process ====================
      // 1. verify token verification was not called
      expect(mockVerifyToken).not.toHaveBeenCalled();

      // 2. verify null payload result
      expect(result).toEqual({
        payload: null,
      });
    });

    it("should throw error when cookie not provided and strict is true", async () => {
      // ==================== Arrange ====================
      // 1. setup no cookie with strict mode
      const verifyParams = {
        cookie: "",
        strict: true,
      };

      // ==================== Act & Assert ====================
      // 1. expect error for missing cookie in strict mode
      await expect(getVerifiedUserPreferencesCookie(verifyParams)).rejects.toThrow(
        "User preferences cookie not found"
      );

      // ==================== Assert Process ====================
      // 1. verify appAssert was called for cookie check
      expect(mockAppAssert).toHaveBeenCalledWith("", 401, "User preferences cookie not found");

      // 2. verify token verification was not called
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it("should throw error when cookie is undefined and strict is true", async () => {
      // ==================== Arrange ====================
      // 1. setup undefined cookie with strict mode
      const verifyParams = {
        cookie: undefined as any,
        strict: true,
      };

      // ==================== Act & Assert ====================
      // 1. expect error for undefined cookie in strict mode
      await expect(getVerifiedUserPreferencesCookie(verifyParams)).rejects.toThrow(
        "User preferences cookie not found"
      );

      // ==================== Assert Process ====================
      // 1. verify appAssert was called for cookie check
      expect(mockAppAssert).toHaveBeenCalledWith(
        undefined,
        401,
        "User preferences cookie not found"
      );

      // 2. verify token verification was not called
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it("should throw error when cookie is invalid", async () => {
      // ==================== Arrange ====================
      // 1. setup invalid cookie scenario
      const verifyParams = {
        cookie: "invalid-cookie",
        strict: false,
      };

      mockVerifyToken.mockResolvedValue({ payload: null } as any);

      // ==================== Act & Assert ====================
      // 1. expect error for invalid cookie
      await expect(getVerifiedUserPreferencesCookie(verifyParams)).rejects.toThrow(
        "User preferences cookie is invalid"
      );

      // ==================== Assert Process ====================
      // 1. verify token verification was attempted
      expect(mockVerifyToken).toHaveBeenCalledWith("invalid-cookie", {
        secret: UserPreferenceSignOptions.secret,
      });

      // 2. verify payload assertion was called
      expect(mockAppAssert).toHaveBeenCalledWith(null, 401, "User preferences cookie is invalid");
    });

    it("should default strict to false when not provided", async () => {
      // ==================== Arrange ====================
      // 1. setup cookie verification without strict parameter
      const verifyParams = {
        cookie: mockCookie,
      };

      // ==================== Act ====================
      // 1. verify user preferences cookie without explicit strict parameter
      const result = await getVerifiedUserPreferencesCookie(verifyParams);

      // ==================== Assert Process ====================
      // 1. verify token verification was called (strict defaults to false)
      expect(mockVerifyToken).toHaveBeenCalledWith(mockCookie, {
        secret: UserPreferenceSignOptions.secret,
      });

      // 2. verify correct result
      expect(result).toEqual({
        payload: mockTokenPayload,
      });
    });

    it("should handle token verification failure", async () => {
      // ==================== Arrange ====================
      // 1. setup token verification failure
      const verifyParams = {
        cookie: mockCookie,
        strict: false,
      };

      const verificationError = new Error("Token expired");
      mockVerifyToken.mockRejectedValue(verificationError);

      // ==================== Act & Assert ====================
      // 1. expect error for token verification failure
      await expect(getVerifiedUserPreferencesCookie(verifyParams)).rejects.toThrow("Token expired");

      // ==================== Assert Process ====================
      // 1. verify token verification was attempted
      expect(mockVerifyToken).toHaveBeenCalledWith(mockCookie, {
        secret: UserPreferenceSignOptions.secret,
      });
    });
  });

  describe("updateUserPreferencesCookie", () => {
    const mockUpdatePayload = {
      language: "zh-TW",
      theme: "light",
    };

    it("should update user preferences cookie successfully", async () => {
      // ==================== Arrange ====================
      const updateParams = {
        userId: mockUserId,
        cookie: mockCookie,
        updatePayload: mockUpdatePayload,
      } as any;

      const mockCurrentPayload = {
        userId: mockUserId,
        language: "en-US",
        theme: "dark",
        autoplay: true,
        volume: 80,
      };

      const mockMergedPayload = {
        ...mockCurrentPayload,
        ...mockUpdatePayload,
      };

      mockLodashOmit.mockReturnValue(mockCurrentPayload as any);

      // ==================== Act ====================
      // 1. update user preferences cookie
      const result = await updateUserPreferencesCookie(updateParams);

      // ==================== Assert Process ====================
      // 1. verify cookie verification was called with strict mode
      expect(mockVerifyToken).toHaveBeenCalledWith(mockCookie, {
        secret: UserPreferenceSignOptions.secret,
      });

      // 2. verify token fields were omitted correctly
      expect(mockLodashOmit).toHaveBeenCalledWith(mockTokenPayload, ["iat", "exp", "aud"]);

      // 3. verify new token was signed with merged payload
      expect(mockSignToken).toHaveBeenCalledWith(mockMergedPayload, UserPreferenceSignOptions);

      // 4. verify user preferences were updated in database
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId,
        {
          $set: {
            "userPreferences.language": "zh-TW",
            "userPreferences.theme": "light",
          },
        },
        { new: true }
      );

      // 5. verify user existence assertion
      expect(mockAppAssert).toHaveBeenCalledWith(mockUser, 404, "User not found");

      // 6. verify correct result
      expect(result).toEqual({
        newCookie: mockNewCookie,
      });
    });

    it("should handle single property update correctly", async () => {
      // ==================== Arrange ====================
      // 1. setup single property update
      const singleUpdatePayload = {
        volume: 90,
      };

      const updateParams = {
        userId: mockUserId,
        cookie: mockCookie,
        updatePayload: singleUpdatePayload,
      } as any;

      const mockCurrentPayload = {
        userId: mockUserId,
        sidebarCollapsed: false,
        locale: "en-US" as any,
      };

      mockLodashOmit.mockReturnValue(mockCurrentPayload as any);

      // ==================== Act ====================
      // 1. update single user preference
      await updateUserPreferencesCookie(updateParams);

      // ==================== Assert Process ====================
      // 1. verify database update with single property
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId,
        {
          $set: {
            "userPreferences.volume": 90,
          },
        },
        { new: true }
      );

      // 2. verify token signing with merged payload
      expect(mockSignToken).toHaveBeenCalledWith(
        {
          ...mockCurrentPayload,
          volume: 90,
        },
        UserPreferenceSignOptions
      );
    });

    it("should handle multiple properties update correctly", async () => {
      // ==================== Arrange ====================
      // 1. setup multiple properties update
      const multipleUpdatePayload = {
        language: "ja",
        theme: "auto",
        autoplay: false,
        volume: 70,
      };

      const updateParams = {
        userId: mockUserId,
        cookie: mockCookie,
        updatePayload: multipleUpdatePayload,
      } as any;

      const mockCurrentPayload = {
        userId: mockUserId,
        language: "en-US",
      };

      mockLodashOmit.mockReturnValue(mockCurrentPayload as any);

      // ==================== Act ====================
      // 1. update multiple user preferences
      await updateUserPreferencesCookie(updateParams);

      // ==================== Assert Process ====================
      // 1. verify database update with multiple properties
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId,
        {
          $set: {
            "userPreferences.language": "ja",
            "userPreferences.theme": "auto",
            "userPreferences.autoplay": false,
            "userPreferences.volume": 70,
          },
        },
        { new: true }
      );

      // 2. verify token signing with all merged properties
      expect(mockSignToken).toHaveBeenCalledWith(
        {
          ...mockCurrentPayload,
          ...multipleUpdatePayload,
        },
        UserPreferenceSignOptions
      );
    });

    it("should throw error when cookie verification fails", async () => {
      // ==================== Arrange ====================
      // 1. setup cookie verification failure
      const updateParams = {
        userId: mockUserId,
        cookie: "invalid-cookie",
        updatePayload: mockUpdatePayload,
      } as any;

      mockVerifyToken.mockResolvedValue({ payload: null } as any);

      // ==================== Act & Assert ====================
      // 1. expect error for invalid cookie
      await expect(updateUserPreferencesCookie(updateParams)).rejects.toThrow(
        "User preferences cookie is invalid"
      );

      // ==================== Assert Process ====================
      // 1. verify cookie verification was attempted with strict mode
      expect(mockVerifyToken).toHaveBeenCalledWith("invalid-cookie", {
        secret: UserPreferenceSignOptions.secret,
      });

      // 2. verify database operations were not called
      expect(mockUserModel.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(mockSignToken).not.toHaveBeenCalled();
    });

    it("should throw error when user not found", async () => {
      // ==================== Arrange ====================
      // 1. setup user not found scenario
      const updateParams = {
        userId: "non-existent-user-id",
        cookie: mockCookie,
        updatePayload: mockUpdatePayload,
      } as any;

      mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

      // ==================== Act & Assert ====================
      // 1. expect error for user not found
      await expect(updateUserPreferencesCookie(updateParams)).rejects.toThrow("User not found");

      // ==================== Assert Process ====================
      // 1. verify database update was attempted
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "non-existent-user-id",
        expect.any(Object),
        { new: true }
      );

      // 2. verify user existence assertion
      expect(mockAppAssert).toHaveBeenCalledWith(null, 404, "User not found");
    });

    it("should handle empty update payload correctly", async () => {
      // ==================== Arrange ====================
      // 1. setup empty update payload
      const emptyUpdatePayload = {};

      const updateParams = {
        userId: mockUserId,
        cookie: mockCookie,
        updatePayload: emptyUpdatePayload,
      } as any;

      const mockCurrentPayload = {
        userId: mockUserId,
        sidebarCollapsed: false,
        locale: "en-US" as any,
      };

      mockLodashOmit.mockReturnValue(mockCurrentPayload as any);

      // ==================== Act ====================
      // 1. update with empty payload
      await updateUserPreferencesCookie(updateParams);

      // ==================== Assert Process ====================
      // 1. verify database update with empty $set object
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId,
        {
          $set: {},
        },
        { new: true }
      );

      // 2. verify token signing with unchanged payload
      expect(mockSignToken).toHaveBeenCalledWith(mockCurrentPayload, UserPreferenceSignOptions);
    });

    it("should handle database update failure", async () => {
      // ==================== Arrange ====================
      // 1. setup database update failure
      const updateParams = {
        userId: mockUserId,
        cookie: mockCookie,
        updatePayload: mockUpdatePayload,
      } as any;

      const databaseError = new Error("Database connection failed");
      mockUserModel.findByIdAndUpdate.mockRejectedValue(databaseError);

      // ==================== Act & Assert ====================
      // 1. expect error for database failure
      await expect(updateUserPreferencesCookie(updateParams)).rejects.toThrow(
        "Database connection failed"
      );

      // ==================== Assert Process ====================
      // 1. verify database update was attempted
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalled();

      // 2. verify token signing was called before database error
      expect(mockSignToken).toHaveBeenCalled();
    });
  });
});
