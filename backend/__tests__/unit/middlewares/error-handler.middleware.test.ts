import { ZodError } from "zod";
import { Request, Response } from "express";
import { AppError } from "@joytify/types/classes";
import { HttpCode, ErrorCode } from "@joytify/types/constants";

// Mock all external dependencies
jest.doMock("../../../src/utils/cookies.util", () => ({
  clearAuthCookies: jest.fn(),
  refreshCookiePath: "/api/auth/refresh",
  setUnauthorizedCookies: jest.fn(),
}));

jest.doMock("../../../src/utils/aws-s3-url.util", () => ({
  deleteAwsFileUrl: jest.fn().mockResolvedValue(true),
}));

jest.doMock("../../../src/utils/aws-url-parser.util", () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    rootPath: "/test",
    subPath: "/test",
    pathParts: ["test"],
    folderPath: "/test",
    mainFolder: "test",
    subFolder: null,
    fileName: "test",
    file: "test",
    extension: null,
    awsS3Key: "test-key",
  }),
}));

jest.doMock("../../../src/config/firebase.config", () => ({
  __esModule: true,
  default: {
    auth: jest.fn().mockReturnValue({
      deleteUser: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Import after mocking
import errorHandler from "../../../src/middlewares/error-handler.middleware";
import {
  clearAuthCookies,
  refreshCookiePath,
  setUnauthorizedCookies,
} from "../../../src/utils/cookies.util";
import { deleteAwsFileUrl } from "../../../src/utils/aws-s3-url.util";
import awsUrlParser from "../../../src/utils/aws-url-parser.util";
import admin from "../../../src/config/firebase.config";

// Mock type definitions
const mockClearAuthCookies = clearAuthCookies as jest.MockedFunction<typeof clearAuthCookies>;
const mockSetUnauthorizedCookies = setUnauthorizedCookies as jest.MockedFunction<
  typeof setUnauthorizedCookies
>;
const mockDeleteAwsFileUrl = deleteAwsFileUrl as jest.MockedFunction<typeof deleteAwsFileUrl>;
const mockAwsUrlParser = awsUrlParser as jest.MockedFunction<typeof awsUrlParser>;
const mockAdmin = admin as jest.Mocked<typeof admin>;

describe("Error Handler Middleware", () => {
  // ==================== Arrange ====================
  // setup mocks and test environment for all tests

  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let errorHandlerMiddleware: ReturnType<typeof errorHandler>;

  beforeEach(() => {
    // clear all mocks to ensure clean state for each test
    jest.clearAllMocks();

    // setup mock request
    mockRequest = {
      path: "/api/test",
      originalUrl: "/api/test",
      cookies: {},
    };

    // setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    // setup mock next function
    mockNext = jest.fn();

    // create error handler middleware
    errorHandlerMiddleware = errorHandler();
  });

  describe("ZodError handling", () => {
    it("should handle ZodError and return validation errors", async () => {
      // ==================== Arrange ====================
      const zodError = new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "number",
          path: ["field"],
          message: "Expected string, received number",
        },
      ]);

      // ==================== Act ====================
      await errorHandlerMiddleware(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        path: ["field"],
        message: "Expected string, received number",
      });
    });

    it("should handle multiple ZodError issues and return first error", async () => {
      // ==================== Arrange ====================
      const zodError = new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "number",
          path: ["field1"],
          message: "First error",
        },
        {
          code: "invalid_type",
          expected: "string",
          received: "boolean",
          path: ["field2"],
          message: "Second error",
        },
      ]);

      // ==================== Act ====================
      await errorHandlerMiddleware(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        path: ["field1"],
        message: "First error",
      });
    });
  });

  describe("Firebase Auth Error handling", () => {
    it("should handle Firebase auth errors", async () => {
      // ==================== Arrange ====================
      const firebaseError = {
        errorInfo: {
          code: "auth/user-not-found",
          message: "User not found",
        },
      };

      // ==================== Act ====================
      await errorHandlerMiddleware(
        firebaseError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: "auth/user-not-found",
        message: "User not found",
      });
    });

    it("should handle Firebase auth errors with different codes", async () => {
      // ==================== Arrange ====================
      const firebaseError = {
        errorInfo: {
          code: "auth/invalid-email",
          message: "Invalid email format",
        },
      };

      // ==================== Act ====================
      await errorHandlerMiddleware(
        firebaseError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: "auth/invalid-email",
        message: "Invalid email format",
      });
    });
  });

  describe("AppError handling", () => {
    it("should handle AppError with unauthorized status", async () => {
      // ==================== Arrange ====================
      const appError = new AppError(HttpCode.UNAUTHORIZED, "Unauthorized access");
      mockRequest.cookies = {};

      // ==================== Act ====================
      await errorHandlerMiddleware(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockSetUnauthorizedCookies).toHaveBeenCalledWith({
        res: mockResponse,
        redirectUrl: "/api/test",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Unauthorized access",
        errorCode: undefined,
      });
    });

    it("should handle AppError with unauthorized status when unauthorized cookie already exists", async () => {
      // ==================== Arrange ====================
      const appError = new AppError(HttpCode.UNAUTHORIZED, "Unauthorized access");
      mockRequest.cookies = { unauthorized: "true" };

      // ==================== Act ====================
      await errorHandlerMiddleware(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockSetUnauthorizedCookies).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Unauthorized access",
        errorCode: undefined,
      });
    });

    it("should handle AppError with invalid Firebase credential", async () => {
      // ==================== Arrange ====================
      const appError = new AppError(HttpCode.BAD_REQUEST, "Invalid Firebase credential");
      appError.errorCode = ErrorCode.INVALID_FIREBASE_CREDENTIAL;
      appError.firebaseUID = "test-uid";

      // ==================== Act ====================
      await errorHandlerMiddleware(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockAdmin.auth).toHaveBeenCalled();
      expect(mockAdmin.auth().deleteUser).toHaveBeenCalledWith("test-uid");
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Firebase credential",
        errorCode: ErrorCode.INVALID_FIREBASE_CREDENTIAL,
      });
    });

    it("should handle AppError with create song error and AWS URL cleanup", async () => {
      // ==================== Arrange ====================
      const appError = new AppError(HttpCode.BAD_REQUEST, "Create song error");
      appError.errorCode = ErrorCode.CREATE_SONG_ERROR;
      appError.awsUrl = ["https://test-bucket.s3.test-region.amazonaws.com/test-key"];

      // ==================== Act ====================
      await errorHandlerMiddleware(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockAwsUrlParser).toHaveBeenCalledWith(
        "https://test-bucket.s3.test-region.amazonaws.com/test-key"
      );
      expect(mockDeleteAwsFileUrl).toHaveBeenCalledWith("test-key");
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Create song error",
        errorCode: ErrorCode.CREATE_SONG_ERROR,
      });
    });

    it("should handle AppError with create song error and multiple AWS URLs", async () => {
      // ==================== Arrange ====================
      const appError = new AppError(HttpCode.BAD_REQUEST, "Create song error");
      appError.errorCode = ErrorCode.CREATE_SONG_ERROR;
      appError.awsUrl = [
        "https://test-bucket.s3.test-region.amazonaws.com/test-key1",
        "https://test-bucket.s3.test-region.amazonaws.com/test-key2",
      ];

      // Mock awsUrlParser to return different keys for different calls
      mockAwsUrlParser
        .mockReturnValueOnce({
          rootPath: "/test",
          subPath: "/test",
          pathParts: ["test"],
          folderPath: "/test",
          mainFolder: "test",
          subFolder: null,
          fileName: "test",
          file: "test",
          extension: null,
          awsS3Key: "test-key1",
        })
        .mockReturnValueOnce({
          rootPath: "/test",
          subPath: "/test",
          pathParts: ["test"],
          folderPath: "/test",
          mainFolder: "test",
          subFolder: null,
          fileName: "test",
          file: "test",
          extension: null,
          awsS3Key: "test-key2",
        });

      // ==================== Act ====================
      await errorHandlerMiddleware(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockAwsUrlParser).toHaveBeenCalledTimes(2);
      expect(mockDeleteAwsFileUrl).toHaveBeenCalledTimes(2);
      expect(mockDeleteAwsFileUrl).toHaveBeenCalledWith("test-key1");
      expect(mockDeleteAwsFileUrl).toHaveBeenCalledWith("test-key2");
    });

    it("should handle AppError with create song error but no AWS URLs", async () => {
      // ==================== Arrange ====================
      const appError = new AppError(HttpCode.BAD_REQUEST, "Create song error");
      appError.errorCode = ErrorCode.CREATE_SONG_ERROR;
      appError.awsUrl = [];

      // ==================== Act ====================
      await errorHandlerMiddleware(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockAwsUrlParser).not.toHaveBeenCalled();
      expect(mockDeleteAwsFileUrl).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Create song error",
        errorCode: ErrorCode.CREATE_SONG_ERROR,
      });
    });

    it("should handle AppError with custom status code and error code", async () => {
      // ==================== Arrange ====================
      const appError = new AppError(HttpCode.CONFLICT, "Custom error");
      appError.errorCode = ErrorCode.DUPLICATE_FIELD;

      // ==================== Act ====================
      await errorHandlerMiddleware(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Custom error",
        errorCode: ErrorCode.DUPLICATE_FIELD,
      });
    });
  });

  describe("MongoDB Error handling", () => {
    it("should handle MongoDB duplicate key error", async () => {
      // ==================== Arrange ====================
      const mongoError = {
        name: "MongoServerError",
        code: 11000,
        errorResponse: {
          keyPattern: {
            email: 1,
          },
        },
      };

      // ==================== Act ====================
      await errorHandlerMiddleware(
        mongoError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Email already exists",
        errorCode: ErrorCode.DUPLICATE_FIELD,
      });
    });

    it("should handle MongoDB duplicate key error with different field", async () => {
      // ==================== Arrange ====================
      const mongoError = {
        name: "MongoServerError",
        code: 11000,
        errorResponse: {
          keyPattern: {
            username: 1,
          },
        },
      };

      // ==================== Act ====================
      await errorHandlerMiddleware(
        mongoError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Username already exists",
        errorCode: ErrorCode.DUPLICATE_FIELD,
      });
    });

    it("should handle MongoDB error with different code", async () => {
      // ==================== Arrange ====================
      const mongoError = {
        name: "MongoServerError",
        code: 121,
        errorResponse: {
          keyPattern: {
            email: 1,
          },
        },
      };

      // ==================== Act ====================
      await errorHandlerMiddleware(
        mongoError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.INTERNAL_SERVER_ERROR);
      expect(mockResponse.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("Refresh cookie path handling", () => {
    it("should clear auth cookies when error occurs on refresh path", async () => {
      // ==================== Arrange ====================
      const genericError = new Error("Generic error");
      mockRequest = {
        ...mockRequest,
        path: refreshCookiePath,
      };

      // ==================== Act ====================
      await errorHandlerMiddleware(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockClearAuthCookies).toHaveBeenCalledWith(mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.INTERNAL_SERVER_ERROR);
      expect(mockResponse.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("Generic error handling", () => {
    it("should handle generic errors", async () => {
      // ==================== Arrange ====================
      const genericError = new Error("Generic error");

      // ==================== Act ====================
      await errorHandlerMiddleware(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.INTERNAL_SERVER_ERROR);
      expect(mockResponse.send).toHaveBeenCalledWith("Internal Server Error");
    });

    it("should handle errors with custom properties", async () => {
      // ==================== Arrange ====================
      const customError = {
        message: "Custom error",
        customProperty: "custom value",
      };

      // ==================== Act ====================
      await errorHandlerMiddleware(
        customError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.INTERNAL_SERVER_ERROR);
      expect(mockResponse.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("Error handling edge cases", () => {
    it("should handle AppError with invalid Firebase credential but no firebaseUID", async () => {
      // ==================== Arrange ====================
      const appError = new AppError(HttpCode.BAD_REQUEST, "Invalid Firebase credential");
      appError.errorCode = ErrorCode.INVALID_FIREBASE_CREDENTIAL;
      appError.firebaseUID = undefined;

      // ==================== Act ====================
      await errorHandlerMiddleware(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockAdmin.auth().deleteUser).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Firebase credential",
        errorCode: ErrorCode.INVALID_FIREBASE_CREDENTIAL,
      });
    });

    it("should handle AppError with create song error but undefined awsUrl", async () => {
      // ==================== Arrange ====================
      const appError = new AppError(HttpCode.BAD_REQUEST, "Create song error");
      appError.errorCode = ErrorCode.CREATE_SONG_ERROR;
      appError.awsUrl = undefined;

      // ==================== Act ====================
      await errorHandlerMiddleware(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockAwsUrlParser).not.toHaveBeenCalled();
      expect(mockDeleteAwsFileUrl).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Create song error",
        errorCode: ErrorCode.CREATE_SONG_ERROR,
      });
    });

    it("should handle MongoDB error without errorResponse", async () => {
      // ==================== Arrange ====================
      const mongoError = {
        name: "MongoServerError",
        code: 121, // Different code to avoid duplicate key logic
        errorResponse: undefined,
      };

      // ==================== Act ====================
      await errorHandlerMiddleware(
        mongoError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.INTERNAL_SERVER_ERROR);
      expect(mockResponse.send).toHaveBeenCalledWith("Internal Server Error");
    });

    it("should handle Firebase auth error without errorInfo", async () => {
      // ==================== Arrange ====================
      const firebaseError = {
        message: "Firebase error without errorInfo",
      };

      // ==================== Act ====================
      await errorHandlerMiddleware(
        firebaseError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // ==================== Assert ====================
      expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.INTERNAL_SERVER_ERROR);
      expect(mockResponse.send).toHaveBeenCalledWith("Internal Server Error");
    });
  });
});
