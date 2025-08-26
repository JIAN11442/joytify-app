import * as admin from "firebase-admin";
import UserModel from "../../../src/models/user.model";
import SessionModel from "../../../src/models/session.model";
import {
  createAccount,
  CreateAccountServiceRequest,
  loginUser,
  LoginServiceRequest,
  logoutUser,
  refreshTokens,
  verifyFirebaseAccessToken,
  loginUserWithThirdParty,
  registerUserWithThirdParty,
} from "../../../src/services/auth.service";
import {
  signToken,
  verifyToken,
  AccessTokenSignOptions,
  RefreshTokenSignOptions,
  UserPreferenceSignOptions,
} from "../../../src/utils/jwt.util";
import appAssert from "../../../src/utils/app-assert.util";
import { thirtyDaysFormNow, oneDay } from "../../../src/utils/date.util";

// Mock all external dependencies
jest.mock("../../../src/models/user.model");
jest.mock("../../../src/models/session.model");
jest.mock("firebase-admin");
jest.mock("../../../src/utils/jwt.util");
jest.mock("../../../src/utils/app-assert.util");
jest.mock("../../../src/utils/date.util");

// Mock type definitions
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockSessionModel = SessionModel as jest.Mocked<typeof SessionModel>;
const mockSignToken = signToken as jest.MockedFunction<typeof signToken>;
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;
const mockAppAssert = appAssert as jest.MockedFunction<typeof appAssert>;
const mockThirtyDaysFormNow = thirtyDaysFormNow as jest.MockedFunction<typeof thirtyDaysFormNow>;
const mockOneDay = oneDay as jest.MockedFunction<typeof oneDay>;

// Mock functions
const mockDeleteUser = jest.fn();
const mockVerifyIdToken = jest.fn();
const mockAuth = jest.fn().mockReturnValue({
  deleteUser: mockDeleteUser,
  verifyIdToken: mockVerifyIdToken,
});

jest.mocked(admin).auth = mockAuth;

describe("Auth Service", () => {
  const mockSessionInfo = {
    userAgent: "Mozilla/5.0 (Test Browser)",
    device: {
      name: "Test Device",
      type: "Laptop",
      os: "Test OS",
      osVersion: "1.0.0",
      screen: {
        width: 1920,
        height: 1080,
        pixelRatio: 1,
      },
      isTouch: false,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    },
    browser: {
      name: "TestBrowser",
      version: "1.0.0",
      engine: "TestEngine",
      engineVersion: "1.0.0",
    },
    network: {
      type: "wifi",
      downlink: 10,
      rtt: 50,
      saveData: false,
    },
    location: {
      ipAddress: "127.0.0.1",
      country: "TestCountry",
      region: "TestRegion",
      city: "TestCity",
      timezone: "+00:00",
      isp: "Test ISP",
    },
    status: {
      online: true,
      lastActive: "2024-01-01T00:00:00.000Z",
    },
  };

  const mockUserResponse = {
    id: "user-123",
    email: "test@example.com",
    username: "test",
    profileImage: "https://example.com/avatar.jpg",
    authForThirdParty: false,
    verified: true,
    toObject: jest.fn().mockReturnValue({
      userPreferences: {
        sidebarCollapsed: false,
        locale: "en-US",
        player: {
          shuffle: false,
          loop: "none",
          volume: 80,
          playbackQueue: { queue: [], currentIndex: 0 },
        },
      },
    }),
    omitPassword: jest.fn().mockReturnValue({
      id: "user-123",
      email: "test@example.com",
      username: "test",
    }),
  };

  const mockSessionResponse = {
    id: "session-123",
    user: "user-123",
    expiresAt: new Date("2024-02-01"),
  };

  beforeEach(() => {
    // reset all mocks
    jest.clearAllMocks();
  });

  describe("createAccount", () => {
    const mockCreateAccountRequest: CreateAccountServiceRequest = {
      email: "test@example.com",
      password: "password123",
      sessionInfo: mockSessionInfo,
      profileImage: "https://example.com/avatar.jpg",
      authForThirdParty: false,
      firebaseUID: "firebase-uid-123",
    };

    it("should create account successfully", async () => {
      // ==================== Arrange ====================
      // 1. setup mock behavior for successful account creation
      mockUserModel.findOne.mockResolvedValue(null); // email does not exist
      mockUserModel.create.mockResolvedValue(mockUserResponse as any);
      mockSessionModel.create.mockResolvedValue(mockSessionResponse as any);
      mockThirtyDaysFormNow.mockReturnValue(new Date("2024-02-01"));
      mockSignToken
        .mockReturnValueOnce("mock-access-token-123")
        .mockReturnValueOnce("mock-refresh-token-123")
        .mockReturnValueOnce("mock-ui-prefs-token-123");

      // ==================== Act ====================
      // 1. execute createAccount function
      const result = await createAccount(mockCreateAccountRequest);

      // ==================== Assert Process ====================
      // 1. verify email duplicate check was executed
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });

      // 2. verify user creation with correct parameters
      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: "test@example.com",
        username: "test",
        password: "password123",
        profileImage: "https://example.com/avatar.jpg",
        authForThirdParty: false,
        verified: true,
      });

      // 3. verify session creation with correct parameters
      expect(mockSessionModel.create).toHaveBeenCalledWith({
        user: "user-123",
        ...mockSessionInfo,
        expiresAt: new Date("2024-02-01"),
      });

      // 4. verify JWT token generation - Access Token
      expect(mockSignToken).toHaveBeenNthCalledWith(
        1,
        {
          userId: "user-123",
          sessionId: "session-123",
          firebaseUserId: "firebase-uid-123",
        },
        AccessTokenSignOptions
      );

      // 5. verify JWT token generation - Refresh Token
      expect(mockSignToken).toHaveBeenNthCalledWith(
        2,
        { sessionId: "session-123" },
        RefreshTokenSignOptions
      );

      // 6. verify JWT token generation - UI Preferences Token
      expect(mockSignToken).toHaveBeenNthCalledWith(
        3,
        {
          sidebarCollapsed: false,
          locale: "en-US",
          player: {
            shuffle: false,
            loop: "none",
            volume: 80,
            playbackQueue: { queue: [], currentIndex: 0 },
          },
        },
        UserPreferenceSignOptions
      );

      // 7. verify total JWT token generation count
      expect(mockSignToken).toHaveBeenCalledTimes(3);

      // 8. verify password removal method was called
      expect(mockUserResponse.omitPassword).toHaveBeenCalled();

      // ==================== Assert Result ====================
      // 1. verify function returns correct format and data
      expect(result).toEqual({
        user: { id: "user-123", email: "test@example.com", username: "test" },
        accessToken: "mock-access-token-123",
        refreshToken: "mock-refresh-token-123",
        ui_prefs: "mock-ui-prefs-token-123",
      });
    });

    it("should throw error if email already exists", async () => {
      // ==================== Arrange ====================
      // 1. setup mock to simulate existing email scenario
      mockUserModel.findOne.mockResolvedValue(mockUserResponse as any);
      mockAppAssert.mockImplementation((condition, statusCode, message) => {
        if (!condition) {
          throw new Error(message);
        }
      });

      // ==================== Act & Assert ====================
      // 1. verify function throws expected error
      await expect(createAccount(mockCreateAccountRequest)).rejects.toThrow(
        "Email is already in use"
      );

      // ==================== Assert Process ====================
      // 1. verify email duplicate check was executed
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });

      // 2. verify appAssert was called with correct parameters
      expect(mockAppAssert).toHaveBeenCalledWith(
        false, // !isEmailExist = !mockUserResponse = false
        expect.any(Number), // HTTP status code (CONFLICT)
        "Email is already in use"
      );

      // 3. ensure subsequent operations were not executed after error
      expect(mockUserModel.create).not.toHaveBeenCalled();
      expect(mockSessionModel.create).not.toHaveBeenCalled();
      expect(mockSignToken).not.toHaveBeenCalled();
    });
  });

  describe("loginUser", () => {
    const mockLoginRequest: LoginServiceRequest = {
      email: "test@example.com",
      password: "password123",
      sessionInfo: mockSessionInfo,
      authForThirdParty: false,
      firebaseUID: "firebase-uid-123",
    };

    const mockUserForLoginResponse = {
      id: "user-123",
      email: "test@example.com",
      authForThirdParty: false,
      comparePassword: jest.fn(),
      toObject: jest.fn().mockReturnValue({
        userPreferences: {
          sidebarCollapsed: false,
          locale: "en-US",
          player: {
            shuffle: false,
            loop: "none",
            volume: 80,
            playbackQueue: { queue: [], currentIndex: 0 },
          },
        },
      }),
    };

    it("should login user successfully with password", async () => {
      // ==================== Arrange ====================
      // 1. setup mock behavior for successful password login
      mockUserModel.findOne.mockResolvedValue(mockUserForLoginResponse as any);
      mockUserForLoginResponse.comparePassword.mockResolvedValue(true); // password matches
      mockSessionModel.create.mockResolvedValue(mockSessionResponse as any);
      mockThirtyDaysFormNow.mockReturnValue(new Date("2024-02-01"));
      mockSignToken
        .mockReturnValueOnce("mock-access-token-456")
        .mockReturnValueOnce("mock-refresh-token-456")
        .mockReturnValueOnce("mock-ui-prefs-token-456");

      // ==================== Act ====================
      // 1. execute loginUser function
      const result = await loginUser(mockLoginRequest);

      // ==================== Assert Process ====================
      // 1. verify user lookup by email
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });

      // 2. verify user existence validation
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        1,
        mockUserForLoginResponse, // user exists
        expect.any(Number), // UNAUTHORIZED status code
        "Invalid email or password"
      );

      // 3. verify third-party validation (user should not be third-party registered)
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        2,
        true, // !user.authForThirdParty = !false = true
        expect.any(Number), // FORBIDDEN status code
        "This account was registered using a third-party service. Please log in with related service to access the account."
      );

      // 4. verify password comparison
      expect(mockUserForLoginResponse.comparePassword).toHaveBeenCalledWith("password123");

      // 5. verify password validation
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        3,
        true, // password matches
        expect.any(Number), // UNAUTHORIZED status code
        "Invalid email or password"
      );

      // 6. verify session creation with correct parameters
      expect(mockSessionModel.create).toHaveBeenCalledWith({
        user: "user-123",
        ...mockSessionInfo,
        expiresAt: new Date("2024-02-01"),
      });

      // 7. verify JWT token generation - Access Token
      expect(mockSignToken).toHaveBeenNthCalledWith(
        1,
        {
          userId: "user-123",
          sessionId: "session-123",
          firebaseUserId: "firebase-uid-123",
        },
        AccessTokenSignOptions
      );

      // 8. verify JWT token generation - Refresh Token
      expect(mockSignToken).toHaveBeenNthCalledWith(
        2,
        { sessionId: "session-123" },
        RefreshTokenSignOptions
      );

      // 9. verify JWT token generation - UI Preferences Token (specific fields only)
      expect(mockSignToken).toHaveBeenNthCalledWith(
        3,
        {
          sidebarCollapsed: false,
          locale: "en-US",
          player: {
            shuffle: false,
            loop: "none",
            volume: 80,
            playbackQueue: { queue: [], currentIndex: 0 },
          },
        },
        UserPreferenceSignOptions
      );

      // 10. verify total JWT token generation count
      expect(mockSignToken).toHaveBeenCalledTimes(3);

      // ==================== Assert Result ====================
      // 1. verify function returns correct format and data
      expect(result).toEqual({
        accessToken: "mock-access-token-456",
        refreshToken: "mock-refresh-token-456",
        ui_prefs: "mock-ui-prefs-token-456",
      });
    });

    it("should throw error if user not found", async () => {
      // ==================== Arrange ====================
      // 1. setup mock to simulate user not found scenario
      mockUserModel.findOne.mockResolvedValue(null);
      mockAppAssert.mockImplementation((condition, statusCode, message) => {
        if (!condition) {
          throw new Error(message);
        }
      });

      // ==================== Act & Assert ====================
      // 1. verify function throws expected error
      await expect(loginUser(mockLoginRequest)).rejects.toThrow("Invalid email or password");

      // ==================== Assert Process ====================
      // 1. verify user lookup by email
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });

      // 2. verify appAssert was called with correct parameters
      expect(mockAppAssert).toHaveBeenCalledWith(
        null, // user not found
        expect.any(Number), // UNAUTHORIZED status code
        "Invalid email or password"
      );

      // 3. ensure subsequent operations were not executed after error
      expect(mockUserForLoginResponse.comparePassword).not.toHaveBeenCalled();
      expect(mockSessionModel.create).not.toHaveBeenCalled();
      expect(mockSignToken).not.toHaveBeenCalled();
    });

    it("should throw error if trying to login third-party account with password", async () => {
      // ==================== Arrange ====================
      // 1. setup mock for third-party registered user
      const mockThirdPartyUser = {
        ...mockUserForLoginResponse,
        authForThirdParty: true, // this user registered with third-party
      };
      mockUserModel.findOne.mockResolvedValue(mockThirdPartyUser as any);
      mockAppAssert
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Invalid email or password");
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error(
              "This account was registered using a third-party service. Please log in with related service to access the account."
            );
          }
        });

      // ==================== Act & Assert ====================
      // 1. verify function throws expected error
      await expect(loginUser(mockLoginRequest)).rejects.toThrow(
        "This account was registered using a third-party service. Please log in with related service to access the account."
      );

      // ==================== Assert Process ====================
      // 1. verify user lookup by email
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });

      // 2. verify user existence validation passed
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        1,
        mockThirdPartyUser, // user exists
        expect.any(Number),
        "Invalid email or password"
      );

      // 3. verify third-party validation failed
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        2,
        false, // !user.authForThirdParty = !true = false
        expect.any(Number), // FORBIDDEN status code
        "This account was registered using a third-party service. Please log in with related service to access the account."
      );

      // 4. ensure subsequent operations were not executed after error
      expect(mockThirdPartyUser.comparePassword).not.toHaveBeenCalled();
      expect(mockSessionModel.create).not.toHaveBeenCalled();
      expect(mockSignToken).not.toHaveBeenCalled();
    });

    it("should throw error if password is incorrect", async () => {
      // Arrange
      mockUserModel.findOne.mockResolvedValue(mockUserForLoginResponse as any);
      mockUserForLoginResponse.comparePassword.mockResolvedValue(false);
      mockAppAssert
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Invalid email or password");
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error(
              "This account was registered using a third-party service. Please log in with related service to access the account."
            );
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Invalid email or password");
          }
        });

      // Act & Assert
      await expect(loginUser(mockLoginRequest)).rejects.toThrow("Invalid email or password");

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });

      expect(mockAppAssert).toHaveBeenNthCalledWith(
        1,
        mockUserForLoginResponse,
        expect.any(Number),
        "Invalid email or password"
      );

      expect(mockAppAssert).toHaveBeenNthCalledWith(
        2,
        true,
        expect.any(Number),
        "This account was registered using a third-party service. Please log in with related service to access the account."
      );

      expect(mockUserForLoginResponse.comparePassword).toHaveBeenCalledWith("password123");

      expect(mockAppAssert).toHaveBeenNthCalledWith(
        3,
        false,
        expect.any(Number),
        "Invalid email or password"
      );

      expect(mockSessionModel.create).not.toHaveBeenCalled();
      expect(mockSignToken).not.toHaveBeenCalled();
    });

    it("should throw error if user is already logged in", async () => {
      // Arrange
      const mockLoginRequestWithAccessToken = {
        ...mockLoginRequest,
        accessToken: "existing-access-token-123",
      };

      mockUserModel.findOne.mockResolvedValue(mockUserForLoginResponse as any);
      mockUserForLoginResponse.comparePassword.mockResolvedValue(true);
      mockVerifyToken.mockResolvedValue({
        payload: {
          userId: "user-123",
          sessionId: "existing-session-456",
        },
      } as any);
      mockSessionModel.exists.mockResolvedValue({ _id: "existing-session-456" });
      mockAppAssert
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Invalid email or password");
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error(
              "This account was registered using a third-party service. Please log in with related service to access the account."
            );
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Invalid email or password");
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("User is already logged in");
          }
        });

      // Act & Assert
      await expect(loginUser(mockLoginRequestWithAccessToken)).rejects.toThrow(
        "User is already logged in"
      );

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });

      expect(mockUserForLoginResponse.comparePassword).toHaveBeenCalledWith("password123");

      expect(mockVerifyToken).toHaveBeenCalledWith("existing-access-token-123", {
        secret: AccessTokenSignOptions.secret,
      });

      expect(mockSessionModel.exists).toHaveBeenCalledWith({
        _id: "existing-session-456",
        user: "user-123",
        expiresAt: { $gt: expect.any(Date) },
      });

      expect(mockAppAssert).toHaveBeenNthCalledWith(
        4,
        false,
        expect.any(Number),
        "User is already logged in"
      );

      expect(mockSessionModel.create).not.toHaveBeenCalled();
      expect(mockSignToken).not.toHaveBeenCalled();
    });
  });

  describe("logoutUser", () => {
    it("should logout user successfully with Firebase user deletion", async () => {
      // ==================== Arrange ====================
      // 1. setup mock behavior for successful logout with Firebase user
      const mockAccessToken = "mock-access-token-789";
      const mockPayload = {
        userId: "user-123",
        sessionId: "session-456",
        firebaseUserId: "firebase-uid-789",
      };
      const mockDeletedSession = { _id: "session-456", user: "user-123" };

      mockVerifyToken.mockResolvedValue({ payload: mockPayload } as any);
      mockSessionModel.findByIdAndDelete.mockResolvedValue(mockDeletedSession as any);
      mockDeleteUser.mockResolvedValue(undefined);

      // ==================== Act ====================
      // 1. execute logoutUser function
      const result = await logoutUser(mockAccessToken);

      // ==================== Assert Process ====================
      // 1. verify access token verification
      expect(mockVerifyToken).toHaveBeenCalledWith(mockAccessToken, {
        secret: AccessTokenSignOptions.secret,
      });

      // 2. verify Firebase user deletion (firebaseUserId exists)
      expect(mockDeleteUser).toHaveBeenCalledWith("firebase-uid-789");

      // 3. verify session deletion
      expect(mockSessionModel.findByIdAndDelete).toHaveBeenCalledWith("session-456");

      // ==================== Assert Result ====================
      // 1. verify function returns deleted session
      expect(result).toEqual(mockDeletedSession);
    });

    it("should logout user successfully without Firebase user deletion", async () => {
      // Arrange
      const mockAccessToken = "mock-access-token-790";
      const mockPayload = {
        userId: "user-123",
        sessionId: "session-457",
      };
      const mockDeletedSession = { _id: "session-457", user: "user-123" };

      mockVerifyToken.mockResolvedValue({ payload: mockPayload } as any);
      mockSessionModel.findByIdAndDelete.mockResolvedValue(mockDeletedSession as any);

      // Act
      const result = await logoutUser(mockAccessToken);

      // Assert
      expect(mockVerifyToken).toHaveBeenCalledWith(mockAccessToken, {
        secret: AccessTokenSignOptions.secret,
      });

      expect(mockDeleteUser).not.toHaveBeenCalled();

      expect(mockSessionModel.findByIdAndDelete).toHaveBeenCalledWith("session-457");

      expect(result).toEqual(mockDeletedSession);
    });

    it("should handle token verification failure gracefully", async () => {
      // Arrange
      const mockAccessToken = "invalid-access-token";
      mockVerifyToken.mockResolvedValue({ payload: undefined } as any);
      mockSessionModel.findByIdAndDelete.mockResolvedValue(null);

      // Act
      const result = await logoutUser(mockAccessToken);

      // Assert
      expect(mockVerifyToken).toHaveBeenCalledWith(mockAccessToken, {
        secret: AccessTokenSignOptions.secret,
      });

      expect(mockDeleteUser).not.toHaveBeenCalled();

      expect(mockSessionModel.findByIdAndDelete).toHaveBeenCalledWith(undefined);

      expect(result).toBeNull();
    });

    it("should handle session deletion failure gracefully", async () => {
      // Arrange
      const mockAccessToken = "mock-access-token-791";
      const mockPayload = {
        userId: "user-123",
        sessionId: "non-existent-session",
        firebaseUserId: "firebase-uid-792",
      };

      mockVerifyToken.mockResolvedValue({ payload: mockPayload } as any);
      mockSessionModel.findByIdAndDelete.mockResolvedValue(null);
      mockDeleteUser.mockResolvedValue(undefined);

      // Act
      const result = await logoutUser(mockAccessToken);

      // Assert
      expect(mockVerifyToken).toHaveBeenCalledWith(mockAccessToken, {
        secret: AccessTokenSignOptions.secret,
      });

      expect(mockDeleteUser).toHaveBeenCalledWith("firebase-uid-792");

      expect(mockSessionModel.findByIdAndDelete).toHaveBeenCalledWith("non-existent-session");

      expect(result).toBeNull();
    });
  });

  describe("refreshTokens", () => {
    it("should refresh tokens successfully with session renewal (session expires in < 1 day)", async () => {
      // ==================== Arrange ====================
      // 1. setup mock behavior for session that needs renewal
      const mockRefreshToken = "mock-refresh-token-123";
      const mockPayload = { sessionId: "session-789" };
      const mockSession = {
        id: "session-789",
        user: "user-456",
        expiresAt: new Date("2024-01-02T10:00:00Z"), // close to expiring
        save: jest.fn(),
      };
      const mockNow = new Date("2024-01-02T00:00:00Z"); // 10 hours before session expires
      const mockOneDayMs = 24 * 60 * 60 * 1000; // 24 hours in ms
      const mockNewExpiresAt = new Date("2024-02-01T00:00:00Z");

      // Mock Date.now to return consistent time
      jest.spyOn(global, "Date").mockImplementation(() => mockNow as any);

      mockVerifyToken.mockResolvedValue({ payload: mockPayload } as any);
      mockSessionModel.findOne.mockResolvedValue(mockSession as any);
      mockOneDay.mockReturnValue(mockOneDayMs);
      mockThirtyDaysFormNow.mockReturnValue(mockNewExpiresAt);
      mockSignToken
        .mockReturnValueOnce("new-refresh-token-456") // new refresh token
        .mockReturnValueOnce("new-access-token-456"); // new access token

      // ==================== Act ====================
      // 1. execute refreshTokens function
      const result = await refreshTokens(mockRefreshToken);

      // ==================== Assert Process ====================
      // 1. verify refresh token verification
      expect(mockVerifyToken).toHaveBeenCalledWith(mockRefreshToken, {
        secret: RefreshTokenSignOptions.secret,
      });

      // 2. verify payload validation
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        1,
        mockPayload,
        expect.any(Number), // UNAUTHORIZED status code
        "Invalid refresh token"
      );

      // 3. verify session lookup with expiration check
      expect(mockSessionModel.findOne).toHaveBeenCalledWith({
        _id: "session-789",
        expiresAt: { $gt: mockNow },
      });

      // 4. verify session validation
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        2,
        mockSession,
        expect.any(Number), // UNAUTHORIZED status code
        "session is expired"
      );

      // 5. verify oneDay function was called for time calculation
      expect(mockOneDay).toHaveBeenCalled();

      // 6. verify session expiration time was updated
      expect(mockSession.expiresAt).toEqual(mockNewExpiresAt);
      expect(mockSession.save).toHaveBeenCalled();

      // 7. verify new refresh token generation (session needed refresh)
      expect(mockSignToken).toHaveBeenNthCalledWith(
        1,
        { sessionId: "session-789" },
        RefreshTokenSignOptions
      );

      // 8. verify new access token generation
      expect(mockSignToken).toHaveBeenNthCalledWith(
        2,
        {
          userId: "user-456",
          sessionId: "session-789",
        },
        AccessTokenSignOptions
      );

      // ==================== Assert Result ====================
      // 1. verify function returns both new tokens
      expect(result).toEqual({
        newAccessToken: "new-access-token-456",
        newRefreshToken: "new-refresh-token-456",
      });

      // Restore Date mock
      jest.restoreAllMocks();
    });

    it("should refresh tokens successfully without session renewal (session expires in > 1 day)", async () => {
      // Arrange
      const mockRefreshToken = "mock-refresh-token-124";
      const mockPayload = { sessionId: "session-790" };
      const mockSession = {
        id: "session-790",
        user: "user-457",
        expiresAt: new Date("2024-01-05T00:00:00Z"),
        save: jest.fn(),
      };
      const mockNow = new Date("2024-01-02T00:00:00Z");
      const mockOneDayMs = 24 * 60 * 60 * 1000;

      jest.spyOn(global, "Date").mockImplementation(() => mockNow as any);

      mockVerifyToken.mockResolvedValue({ payload: mockPayload } as any);
      mockSessionModel.findOne.mockResolvedValue(mockSession as any);
      mockOneDay.mockReturnValue(mockOneDayMs);
      mockSignToken.mockReturnValueOnce("new-access-token-457");

      // Act
      const result = await refreshTokens(mockRefreshToken);

      // Assert
      expect(mockVerifyToken).toHaveBeenCalledWith(mockRefreshToken, {
        secret: RefreshTokenSignOptions.secret,
      });

      expect(mockSessionModel.findOne).toHaveBeenCalledWith({
        _id: "session-790",
        expiresAt: { $gt: mockNow },
      });

      expect(mockOneDay).toHaveBeenCalled();

      expect(mockSession.save).not.toHaveBeenCalled();
      expect(mockThirtyDaysFormNow).not.toHaveBeenCalled();

      expect(mockSignToken).toHaveBeenCalledTimes(1);
      expect(mockSignToken).toHaveBeenCalledWith(
        {
          userId: "user-457",
          sessionId: "session-790",
        },
        AccessTokenSignOptions
      );

      expect(result).toEqual({
        newAccessToken: "new-access-token-457",
        newRefreshToken: undefined,
      });

      jest.restoreAllMocks();
    });

    it("should throw error if refresh token is invalid", async () => {
      // Arrange
      const mockRefreshToken = "invalid-refresh-token";
      mockVerifyToken.mockResolvedValue({ payload: undefined } as any);
      mockAppAssert.mockImplementation((condition, statusCode, message) => {
        if (!condition) {
          throw new Error(message);
        }
      });

      // Act & Assert
      await expect(refreshTokens(mockRefreshToken)).rejects.toThrow("Invalid refresh token");

      expect(mockVerifyToken).toHaveBeenCalledWith(mockRefreshToken, {
        secret: RefreshTokenSignOptions.secret,
      });

      expect(mockAppAssert).toHaveBeenCalledWith(
        undefined,
        expect.any(Number),
        "Invalid refresh token"
      );

      expect(mockSessionModel.findOne).not.toHaveBeenCalled();
      expect(mockSignToken).not.toHaveBeenCalled();
    });

    it("should throw error if session is expired or not found", async () => {
      // Arrange
      const mockRefreshToken = "mock-refresh-token-125";
      const mockPayload = { sessionId: "expired-session-123" };
      const mockNow = new Date("2024-01-02T00:00:00Z");

      jest.spyOn(global, "Date").mockImplementation(() => mockNow as any);

      mockVerifyToken.mockResolvedValue({ payload: mockPayload } as any);
      mockSessionModel.findOne.mockResolvedValue(null);
      mockAppAssert
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Invalid refresh token");
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("session is expired");
          }
        });

      // Act & Assert
      await expect(refreshTokens(mockRefreshToken)).rejects.toThrow("session is expired");

      expect(mockVerifyToken).toHaveBeenCalledWith(mockRefreshToken, {
        secret: RefreshTokenSignOptions.secret,
      });

      expect(mockAppAssert).toHaveBeenNthCalledWith(
        1,
        mockPayload,
        expect.any(Number),
        "Invalid refresh token"
      );

      expect(mockSessionModel.findOne).toHaveBeenCalledWith({
        _id: "expired-session-123",
        expiresAt: { $gt: mockNow },
      });

      expect(mockAppAssert).toHaveBeenNthCalledWith(
        2,
        null,
        expect.any(Number),
        "session is expired"
      );

      expect(mockSignToken).not.toHaveBeenCalled();

      jest.restoreAllMocks();
    });
  });

  describe("verifyFirebaseAccessToken", () => {
    it("should verify Firebase access token successfully with picture", async () => {
      // ==================== Arrange ====================
      // 1. setup mock behavior for successful Firebase token verification
      const mockFirebaseToken = "mock-firebase-token-123";
      const mockDecodedUser = {
        email: "test@example.com",
        uid: "firebase-uid-456",
        picture: "https://example.com/s96-c/avatar.jpg",
      };

      mockVerifyIdToken.mockResolvedValue(mockDecodedUser);

      // ==================== Act ====================
      // 1. execute verifyFirebaseAccessToken function
      const result = await verifyFirebaseAccessToken(mockFirebaseToken);

      // ==================== Assert Process ====================
      // 1. verify Firebase token verification
      expect(mockVerifyIdToken).toHaveBeenCalledWith(mockFirebaseToken);

      // 2. verify decodedUser validation
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        1,
        mockDecodedUser,
        expect.any(Number), // UNAUTHORIZED status code
        "Invalid firebase access token",
        expect.any(String), // INVALID_FIREBASE_CREDENTIAL error code
        "firebase-uid-456"
      );

      // 3. verify email validation
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        2,
        "test@example.com",
        expect.any(Number), // BAD_REQUEST status code
        "Third-party do not provide email",
        expect.any(String), // INVALID_FIREBASE_CREDENTIAL error code
        "firebase-uid-456"
      );

      // ==================== Assert Result ====================
      // 1. verify function returns processed user data with upgraded picture
      expect(result).toEqual({
        email: "test@example.com",
        generatePicture: "https://example.com/s384-c/avatar.jpg", // upgraded to 384x384
        uid: "firebase-uid-456",
      });
    });

    it("should verify Firebase access token successfully without picture", async () => {
      // Arrange
      const mockFirebaseToken = "mock-firebase-token-124";
      const mockDecodedUser = {
        email: "nopic@example.com",
        uid: "firebase-uid-457",
      };

      mockVerifyIdToken.mockResolvedValue(mockDecodedUser);

      // Act
      const result = await verifyFirebaseAccessToken(mockFirebaseToken);

      // Assert
      expect(mockVerifyIdToken).toHaveBeenCalledWith(mockFirebaseToken);

      expect(mockAppAssert).toHaveBeenNthCalledWith(
        1,
        mockDecodedUser,
        expect.any(Number),
        "Invalid firebase access token",
        expect.any(String),
        "firebase-uid-457"
      );

      expect(mockAppAssert).toHaveBeenNthCalledWith(
        2,
        "nopic@example.com",
        expect.any(Number),
        "Third-party do not provide email",
        expect.any(String),
        "firebase-uid-457"
      );

      expect(result).toEqual({
        email: "nopic@example.com",
        generatePicture: undefined,
        uid: "firebase-uid-457",
      });
    });

    it("should throw error if Firebase token is invalid", async () => {
      // Arrange
      const mockFirebaseToken = "invalid-firebase-token";
      const mockError = new Error("Firebase token verification failed");

      mockVerifyIdToken.mockRejectedValue(mockError);

      // Act & Assert
      await expect(verifyFirebaseAccessToken(mockFirebaseToken)).rejects.toThrow(
        "Firebase token verification failed"
      );

      expect(mockVerifyIdToken).toHaveBeenCalledWith(mockFirebaseToken);

      expect(mockAppAssert).not.toHaveBeenCalled();
    });

    it("should throw error if decoded user is invalid", async () => {
      // Arrange
      const mockFirebaseToken = "mock-firebase-token-125";
      const mockDecodedUser = null;

      mockVerifyIdToken.mockResolvedValue(mockDecodedUser);

      // Act & Assert
      await expect(verifyFirebaseAccessToken(mockFirebaseToken)).rejects.toThrow(
        /Cannot destructure property 'email' of '.*' as it is null./
      );

      expect(mockVerifyIdToken).toHaveBeenCalledWith(mockFirebaseToken);

      expect(mockAppAssert).not.toHaveBeenCalled();
    });

    it("should throw error if email is not provided by third-party", async () => {
      // Arrange
      const mockFirebaseToken = "mock-firebase-token-126";
      const mockDecodedUser = {
        uid: "firebase-uid-458",
        picture: "https://example.com/avatar.jpg",
      };

      mockVerifyIdToken.mockResolvedValue(mockDecodedUser);
      mockAppAssert
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Invalid firebase access token");
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Third-party do not provide email");
          }
        });

      // Act & Assert
      await expect(verifyFirebaseAccessToken(mockFirebaseToken)).rejects.toThrow(
        "Third-party do not provide email"
      );

      expect(mockVerifyIdToken).toHaveBeenCalledWith(mockFirebaseToken);

      expect(mockAppAssert).toHaveBeenNthCalledWith(
        1,
        mockDecodedUser,
        expect.any(Number),
        "Invalid firebase access token",
        expect.any(String),
        "firebase-uid-458"
      );

      expect(mockAppAssert).toHaveBeenNthCalledWith(
        2,
        undefined,
        expect.any(Number),
        "Third-party do not provide email",
        expect.any(String),
        "firebase-uid-458"
      );
    });
  });

  describe("loginUserWithThirdParty", () => {
    const mockAuthWithThirdPartyRequest = {
      token: "mock-firebase-token-123",
      sessionInfo: mockSessionInfo,
    };

    it("should login user with third-party successfully", async () => {
      // ==================== Arrange ====================
      // 1. setup mock behavior for successful third-party login
      const mockDecodedUser = {
        email: "test@example.com",
        uid: "firebase-uid-456",
      };
      const mockThirdPartyUser = {
        id: "user-123",
        email: "test@example.com",
        authForThirdParty: true, // user registered with third-party
        toObject: jest.fn().mockReturnValue({
          userPreferences: {
            sidebarCollapsed: false,
            locale: "en-US",
            player: {
              shuffle: false,
              loop: "none",
              volume: 80,
              playbackQueue: { queue: [], currentIndex: 0 },
            },
          },
        }),
      };

      mockVerifyIdToken.mockResolvedValue(mockDecodedUser);
      mockUserModel.findOne.mockResolvedValue(mockThirdPartyUser as any);
      mockSessionModel.create.mockResolvedValue(mockSessionResponse as any);
      mockThirtyDaysFormNow.mockReturnValue(new Date("2024-02-01"));
      mockSignToken
        .mockReturnValueOnce("mock-access-token-789")
        .mockReturnValueOnce("mock-refresh-token-789")
        .mockReturnValueOnce("mock-ui-prefs-token-789");

      // ==================== Act ====================
      // 1. execute loginUserWithThirdParty function
      const result = await loginUserWithThirdParty(mockAuthWithThirdPartyRequest);

      // ==================== Assert Process ====================
      // 1. verify Firebase token verification
      expect(mockVerifyIdToken).toHaveBeenCalledWith("mock-firebase-token-123");

      // 2. verify decodedUser validation
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        1,
        mockDecodedUser,
        expect.any(Number), // UNAUTHORIZED status code
        "Invalid firebase access token",
        expect.any(String), // INVALID_FIREBASE_CREDENTIAL error code
        "firebase-uid-456"
      );

      // 3. verify email validation
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        2,
        "test@example.com",
        expect.any(Number), // BAD_REQUEST status code
        "Third-party do not provide email",
        expect.any(String), // INVALID_FIREBASE_CREDENTIAL error code
        "firebase-uid-456"
      );

      // 4. verify user lookup by email
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });

      // 5. verify user existence validation
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        3,
        mockThirdPartyUser, // user exists
        expect.any(Number), // NOT_FOUND status code
        "User not found",
        expect.any(String), // INVALID_FIREBASE_CREDENTIAL error code
        "firebase-uid-456"
      );

      // 6. verify third-party validation (user should be third-party registered)
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        4,
        true, // user.authForThirdParty = true
        expect.any(Number), // FORBIDDEN status code
        "This account was registered without using third-party service. Please log in with password to access the account.",
        expect.any(String), // INVALID_FIREBASE_CREDENTIAL error code
        "firebase-uid-456"
      );

      // 7. verify session creation with correct parameters
      expect(mockSessionModel.create).toHaveBeenCalledWith({
        user: "user-123",
        ...mockSessionInfo,
        expiresAt: new Date("2024-02-01"),
      });

      // 8. verify JWT token generation - Access Token
      expect(mockSignToken).toHaveBeenNthCalledWith(
        1,
        {
          userId: "user-123",
          sessionId: "session-123",
          firebaseUserId: "firebase-uid-456",
        },
        AccessTokenSignOptions
      );

      // 9. verify JWT token generation - Refresh Token
      expect(mockSignToken).toHaveBeenNthCalledWith(
        2,
        { sessionId: "session-123" },
        RefreshTokenSignOptions
      );

      // 10. verify JWT token generation - UI Preferences Token
      expect(mockSignToken).toHaveBeenNthCalledWith(
        3,
        {
          sidebarCollapsed: false,
          locale: "en-US",
          player: {
            shuffle: false,
            loop: "none",
            volume: 80,
            playbackQueue: { queue: [], currentIndex: 0 },
          },
        },
        UserPreferenceSignOptions
      );

      // 11. verify total JWT token generation count
      expect(mockSignToken).toHaveBeenCalledTimes(3);

      // ==================== Assert Result ====================
      // 1. verify function returns correct format and data
      expect(result).toEqual({
        accessToken: "mock-access-token-789",
        refreshToken: "mock-refresh-token-789",
        ui_prefs: "mock-ui-prefs-token-789",
      });
    });

    it("should throw error if user not found", async () => {
      // ==================== Arrange ====================
      // 1. setup mock behavior for user not found scenario
      const mockDecodedUser = {
        email: "nonexistent@example.com",
        uid: "firebase-uid-789",
      };

      mockVerifyIdToken.mockResolvedValue(mockDecodedUser);
      mockUserModel.findOne.mockResolvedValue(null); // user not found
      mockAppAssert
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Invalid firebase access token");
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Third-party do not provide email");
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("User not found");
          }
        });

      // ==================== Act & Assert ====================
      // 1. verify function throws expected error
      await expect(loginUserWithThirdParty(mockAuthWithThirdPartyRequest)).rejects.toThrow(
        "User not found"
      );

      // ==================== Assert Process ====================
      // 1. verify Firebase token verification
      expect(mockVerifyIdToken).toHaveBeenCalledWith("mock-firebase-token-123");

      // 2. verify user lookup by email
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: "nonexistent@example.com" });

      // 3. verify user existence validation failed
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        3,
        null, // user not found
        expect.any(Number), // NOT_FOUND status code
        "User not found",
        expect.any(String), // INVALID_FIREBASE_CREDENTIAL error code
        "firebase-uid-789"
      );

      // 4. ensure subsequent operations were not executed after error
      expect(mockSessionModel.create).not.toHaveBeenCalled();
      expect(mockSignToken).not.toHaveBeenCalled();
    });

    it("should throw error if user exists but not registered with third-party", async () => {
      // ==================== Arrange ====================
      // 1. setup mock behavior for user exists but not third-party registered
      const mockDecodedUser = {
        email: "test@example.com",
        uid: "firebase-uid-790",
      };
      const mockNonThirdPartyUser = {
        id: "user-124",
        email: "test@example.com",
        authForThirdParty: false, // user not registered with third-party
      };

      mockVerifyIdToken.mockResolvedValue(mockDecodedUser);
      mockUserModel.findOne.mockResolvedValue(mockNonThirdPartyUser as any);
      mockAppAssert
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Invalid firebase access token");
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Third-party do not provide email");
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("User not found");
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error(
              "This account was registered without using third-party service. Please log in with password to access the account."
            );
          }
        });

      // ==================== Act & Assert ====================
      // 1. verify function throws expected error
      await expect(loginUserWithThirdParty(mockAuthWithThirdPartyRequest)).rejects.toThrow(
        "This account was registered without using third-party service. Please log in with password to access the account."
      );

      // ==================== Assert Process ====================
      // 1. verify Firebase token verification
      expect(mockVerifyIdToken).toHaveBeenCalledWith("mock-firebase-token-123");

      // 2. verify user lookup by email
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });

      // 3. verify user existence validation passed
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        3,
        mockNonThirdPartyUser, // user exists
        expect.any(Number), // NOT_FOUND status code
        "User not found",
        expect.any(String), // INVALID_FIREBASE_CREDENTIAL error code
        "firebase-uid-790"
      );

      // 4. verify third-party validation failed
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        4,
        false, // user.authForThirdParty = false
        expect.any(Number), // FORBIDDEN status code
        "This account was registered without using third-party service. Please log in with password to access the account.",
        expect.any(String), // INVALID_FIREBASE_CREDENTIAL error code
        "firebase-uid-790"
      );

      // 5. ensure subsequent operations were not executed after error
      expect(mockSessionModel.create).not.toHaveBeenCalled();
      expect(mockSignToken).not.toHaveBeenCalled();
    });
  });

  describe("registerUserWithThirdParty", () => {
    const mockAuthWithThirdPartyRequest = {
      token: "mock-firebase-token-456",
      sessionInfo: mockSessionInfo,
    };

    it("should register user with third-party successfully", async () => {
      // ==================== Arrange ====================
      // 1. setup mock behavior for successful third-party registration
      const mockDecodedUser = {
        email: "newuser@example.com",
        uid: "firebase-uid-789",
        picture: "https://example.com/s96-c/avatar.jpg",
      };
      const mockNewUser = {
        id: "user-125",
        email: "newuser@example.com",
        username: "newuser",
        profileImage: "https://example.com/s384-c/avatar.jpg", // upgraded picture
        authForThirdParty: true,
        verified: true,
        toObject: jest.fn().mockReturnValue({
          userPreferences: {
            sidebarCollapsed: false,
            locale: "en-US",
            player: {
              shuffle: false,
              loop: "none",
              volume: 80,
              playbackQueue: { queue: [], currentIndex: 0 },
            },
          },
        }),
        omitPassword: jest.fn().mockReturnValue({
          id: "user-125",
          email: "newuser@example.com",
          username: "newuser",
        }),
      };

      mockVerifyIdToken.mockResolvedValue(mockDecodedUser);
      mockUserModel.findOne.mockResolvedValue(null); // email does not exist
      mockUserModel.create.mockResolvedValue(mockNewUser as any);
      mockSessionModel.create.mockResolvedValue(mockSessionResponse as any);
      mockThirtyDaysFormNow.mockReturnValue(new Date("2024-02-01"));
      mockSignToken
        .mockReturnValueOnce("mock-access-token-890")
        .mockReturnValueOnce("mock-refresh-token-890")
        .mockReturnValueOnce("mock-ui-prefs-token-890");

      // ==================== Act ====================
      // 1. execute registerUserWithThirdParty function
      const result = await registerUserWithThirdParty(mockAuthWithThirdPartyRequest);

      // ==================== Assert Process ====================
      // 1. verify Firebase token verification
      expect(mockVerifyIdToken).toHaveBeenCalledWith("mock-firebase-token-456");

      // 2. verify decodedUser validation
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        1,
        mockDecodedUser,
        expect.any(Number), // UNAUTHORIZED status code
        "Invalid firebase access token",
        expect.any(String), // INVALID_FIREBASE_CREDENTIAL error code
        "firebase-uid-789"
      );

      // 3. verify email validation
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        2,
        "newuser@example.com",
        expect.any(Number), // BAD_REQUEST status code
        "Third-party do not provide email",
        expect.any(String), // INVALID_FIREBASE_CREDENTIAL error code
        "firebase-uid-789"
      );

      // 4. verify email duplicate check was executed
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: "newuser@example.com" });

      // 5. verify user creation with correct parameters
      expect(mockUserModel.create).toHaveBeenCalledWith({
        email: "newuser@example.com",
        username: "newuser",
        password: "",
        profileImage: "https://example.com/s384-c/avatar.jpg", // upgraded picture
        authForThirdParty: true,
        verified: true,
      });

      // 6. verify session creation with correct parameters
      expect(mockSessionModel.create).toHaveBeenCalledWith({
        user: "user-125",
        ...mockSessionInfo,
        expiresAt: new Date("2024-02-01"),
      });

      // 7. verify JWT token generation - Access Token
      expect(mockSignToken).toHaveBeenNthCalledWith(
        1,
        {
          userId: "user-125",
          sessionId: "session-123",
          firebaseUserId: "firebase-uid-789",
        },
        AccessTokenSignOptions
      );

      // 8. verify JWT token generation - Refresh Token
      expect(mockSignToken).toHaveBeenNthCalledWith(
        2,
        { sessionId: "session-123" },
        RefreshTokenSignOptions
      );

      // 9. verify JWT token generation - UI Preferences Token
      expect(mockSignToken).toHaveBeenNthCalledWith(
        3,
        {
          sidebarCollapsed: false,
          locale: "en-US",
          player: {
            shuffle: false,
            loop: "none",
            volume: 80,
            playbackQueue: { queue: [], currentIndex: 0 },
          },
        },
        UserPreferenceSignOptions
      );

      // 10. verify total JWT token generation count
      expect(mockSignToken).toHaveBeenCalledTimes(3);

      // 11. verify password removal method was called
      expect(mockNewUser.omitPassword).toHaveBeenCalled();

      // ==================== Assert Result ====================
      // 1. verify function returns correct format and data
      expect(result).toEqual({
        user: { id: "user-125", email: "newuser@example.com", username: "newuser" },
        accessToken: "mock-access-token-890",
        refreshToken: "mock-refresh-token-890",
        ui_prefs: "mock-ui-prefs-token-890",
      });
    });

    it("should throw error if Firebase token is invalid", async () => {
      // ==================== Arrange ====================
      // 1. setup mock behavior for invalid Firebase token
      const mockError = new Error("Firebase token verification failed");

      mockVerifyIdToken.mockRejectedValue(mockError);

      // ==================== Act & Assert ====================
      // 1. verify function throws Firebase verification error
      await expect(registerUserWithThirdParty(mockAuthWithThirdPartyRequest)).rejects.toThrow(
        "Firebase token verification failed"
      );

      // ==================== Assert Process ====================
      // 1. verify Firebase token verification was attempted
      expect(mockVerifyIdToken).toHaveBeenCalledWith("mock-firebase-token-456");

      // 2. ensure appAssert was not called (error thrown before validation)
      expect(mockAppAssert).not.toHaveBeenCalled();

      // 3. ensure subsequent operations were not executed after error
      expect(mockUserModel.findOne).not.toHaveBeenCalled();
      expect(mockUserModel.create).not.toHaveBeenCalled();
      expect(mockSessionModel.create).not.toHaveBeenCalled();
      expect(mockSignToken).not.toHaveBeenCalled();
    });

    it("should throw error if email already exists", async () => {
      // ==================== Arrange ====================
      // 1. setup mock behavior for existing email scenario
      const mockDecodedUser = {
        email: "existing@example.com",
        uid: "firebase-uid-791",
        picture: "https://example.com/avatar.jpg",
      };

      mockVerifyIdToken.mockResolvedValue(mockDecodedUser);
      mockUserModel.findOne.mockResolvedValue(mockUserResponse as any); // email exists
      mockAppAssert
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Invalid firebase access token");
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Third-party do not provide email");
          }
        })
        .mockImplementationOnce((condition) => {
          if (!condition) {
            throw new Error("Email is already in use");
          }
        });

      // ==================== Act & Assert ====================
      // 1. verify function throws expected error
      await expect(registerUserWithThirdParty(mockAuthWithThirdPartyRequest)).rejects.toThrow(
        "Email is already in use"
      );

      // ==================== Assert Process ====================
      // 1. verify Firebase token verification
      expect(mockVerifyIdToken).toHaveBeenCalledWith("mock-firebase-token-456");

      // 2. verify email duplicate check was executed
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: "existing@example.com" });

      // 3. verify appAssert was called with correct parameters
      expect(mockAppAssert).toHaveBeenNthCalledWith(
        3,
        false, // !isEmailExist = !mockUserResponse = false
        expect.any(Number), // CONFLICT status code
        "Email is already in use"
      );

      // 4. ensure subsequent operations were not executed after error
      expect(mockUserModel.create).not.toHaveBeenCalled();
      expect(mockSessionModel.create).not.toHaveBeenCalled();
      expect(mockSignToken).not.toHaveBeenCalled();
    });
  });
});
