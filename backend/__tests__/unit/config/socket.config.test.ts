import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import {
  initializeSocket,
  getSocketServer,
  AuthenticatedSocket,
} from "../../../src/config/socket.config";
import { ORIGIN_APP } from "../../../src/constants/env-validate.constant";
import { verifyToken, AccessTokenSignOptions } from "../../../src/utils/jwt.util";

// Mock all external dependencies
jest.mock("socket.io");
jest.mock("../../../src/utils/jwt.util");
jest.mock("../../../src/constants/env-validate.constant", () => ({
  ORIGIN_APP: "http://localhost:3000",
}));

// Mock type definitions
const MockSocketIOServer = SocketIOServer as jest.MockedClass<typeof SocketIOServer>;
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

// Mock console methods
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

describe("Socket Config", () => {
  // Mock data constants
  const mockUserId = "507f1f77bcf86cd799439011";
  const mockSessionId = "507f1f77bcf86cd799439012";
  const mockSocketId = "socket_123";
  const mockToken = "mock-jwt-token";
  const mockNotificationId = "507f1f77bcf86cd799439013";

  let mockServer: HTTPServer;
  let mockSocketIO: jest.Mocked<SocketIOServer>;
  let mockSocket: jest.Mocked<AuthenticatedSocket>;
  let mockMiddleware: any;
  let mockOnConnection: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock HTTP server
    mockServer = {} as HTTPServer;

    // Mock authenticated socket
    mockSocket = {
      id: mockSocketId,
      userId: mockUserId,
      sessionId: mockSessionId,
      handshake: {
        auth: { token: mockToken },
        headers: { cookie: `accessToken=${mockToken}; Path=/` },
      },
      join: jest.fn(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      on: jest.fn(),
    } as any;

    // Mock Socket.IO server
    mockSocketIO = {
      use: jest.fn(),
      on: jest.fn(),
    } as any;

    // Mock Socket.IO constructor
    MockSocketIOServer.mockImplementation(() => mockSocketIO);

    // Mock middleware and connection handlers
    mockMiddleware = jest.fn();
    mockOnConnection = jest.fn();

    mockSocketIO.use.mockImplementation((middleware) => {
      mockMiddleware = middleware;
      return mockSocketIO;
    });

    mockSocketIO.on.mockImplementation((event, handler) => {
      if (event === "connection") {
        mockOnConnection = handler;
      }
      return mockSocketIO;
    });
  });

  afterAll(() => {
    // Restore console methods
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe("initializeSocket", () => {
    it("should initialize Socket.IO server with correct configuration", () => {
      // ==================== Act ====================
      initializeSocket(mockServer);

      // ==================== Assert Process ====================
      // 1. verify Socket.IO server was created with correct config
      expect(MockSocketIOServer).toHaveBeenCalledWith(mockServer, {
        cors: {
          origin: ORIGIN_APP,
          methods: ["GET", "POST"],
          credentials: true,
        },
      });

      // 2. verify middleware was registered
      expect(mockSocketIO.use).toHaveBeenCalledWith(expect.any(Function));

      // 3. verify connection handler was registered
      expect(mockSocketIO.on).toHaveBeenCalledWith("connection", expect.any(Function));

      // 4. verify success log
      expect(mockConsoleLog).toHaveBeenCalledWith("✅ Socket.io server initialized successfully");
    });

    it("should handle initialization errors", () => {
      // ==================== Arrange ====================
      const mockError = new Error("Socket initialization failed");
      MockSocketIOServer.mockImplementation(() => {
        throw mockError;
      });

      // ==================== Act & Assert ====================
      expect(() => initializeSocket(mockServer)).toThrow(mockError);

      // ==================== Assert Process ====================
      expect(mockConsoleError).toHaveBeenCalledWith(
        "🔴 Socket.io server initialization failed:",
        mockError
      );
    });
  });

  describe("Socket Authentication Middleware", () => {
    beforeEach(() => {
      initializeSocket(mockServer);
    });

    it("should authenticate socket with valid token from auth object", async () => {
      // ==================== Arrange ====================
      const mockPayload = { userId: mockUserId, sessionId: mockSessionId };
      mockVerifyToken.mockResolvedValue({ payload: mockPayload });

      const mockNext = jest.fn();

      // ==================== Act ====================
      await mockMiddleware(mockSocket, mockNext);

      // ==================== Assert Process ====================
      // 1. verify token verification
      expect(mockVerifyToken).toHaveBeenCalledWith(mockToken, {
        secret: AccessTokenSignOptions.secret,
      });

      // 2. verify socket properties were set
      expect(mockSocket.userId).toBe(mockUserId);
      expect(mockSocket.sessionId).toBe(mockSessionId);

      // 3. verify authentication success log
      expect(mockConsoleLog).toHaveBeenCalledWith(`🔐 Socket authenticated: ${mockUserId}`);

      // 4. verify next was called without error
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should authenticate socket with token from cookie", async () => {
      // ==================== Arrange ====================
      const mockPayload = { userId: mockUserId, sessionId: mockSessionId };
      mockVerifyToken.mockResolvedValue({ payload: mockPayload });

      const socketWithoutAuth = {
        ...mockSocket,
        handshake: {
          auth: {},
          headers: { cookie: `accessToken=${mockToken}; Path=/` },
        },
      };

      const mockNext = jest.fn();

      // ==================== Act ====================
      await mockMiddleware(socketWithoutAuth, mockNext);

      // ==================== Assert Process ====================
      // 1. verify token was extracted from cookie and verified
      expect(mockVerifyToken).toHaveBeenCalledWith(mockToken, {
        secret: AccessTokenSignOptions.secret,
      });

      // 2. verify authentication success
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should reject authentication when no token provided", async () => {
      // ==================== Arrange ====================
      const socketWithoutToken = {
        ...mockSocket,
        handshake: {
          auth: {},
          headers: {},
        },
      };

      const mockNext = jest.fn();

      // ==================== Act ====================
      await mockMiddleware(socketWithoutToken, mockNext);

      // ==================== Assert Process ====================
      // 1. verify next was called with error
      expect(mockNext).toHaveBeenCalledWith(new Error("No token provided"));

      // 2. verify no token verification occurred
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it("should reject authentication when token is invalid", async () => {
      // ==================== Arrange ====================
      mockVerifyToken.mockResolvedValue({ payload: undefined });

      const mockNext = jest.fn();

      // ==================== Act ====================
      await mockMiddleware(mockSocket, mockNext);

      // ==================== Assert Process ====================
      // 1. verify next was called with error
      expect(mockNext).toHaveBeenCalledWith(new Error("Invalid token"));

      // 2. verify token verification was attempted
      expect(mockVerifyToken).toHaveBeenCalledWith(mockToken, {
        secret: AccessTokenSignOptions.secret,
      });
    });

    it("should handle token verification errors", async () => {
      // ==================== Arrange ====================
      const mockError = new Error("Token verification failed");
      mockVerifyToken.mockRejectedValue(mockError);

      const mockNext = jest.fn();

      // ==================== Act ====================
      await mockMiddleware(mockSocket, mockNext);

      // ==================== Assert Process ====================
      // 1. verify error was logged
      expect(mockConsoleError).toHaveBeenCalledWith("🔴 Socket authentication error:", mockError);

      // 2. verify next was called with authentication failed error
      expect(mockNext).toHaveBeenCalledWith(new Error("Authentication failed"));
    });
  });

  describe("Socket Connection Handler", () => {
    beforeEach(() => {
      initializeSocket(mockServer);
    });

    it("should handle socket connection correctly", () => {
      // ==================== Act ====================
      mockOnConnection(mockSocket);

      // ==================== Assert Process ====================
      // 1. verify connection log
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `🔌 Socket connected: ${mockUserId} (${mockSocketId})`
      );

      // 2. verify user joined their room
      expect(mockSocket.join).toHaveBeenCalledWith(`user:${mockUserId}`);

      // 3. verify event handlers were registered
      expect(mockSocket.on).toHaveBeenCalledWith("notification:mark-read", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith("notification:delete", expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
    });

    it("should handle notification mark-read event", () => {
      // ==================== Arrange ====================
      let markReadHandler: Function;
      mockSocket.on.mockImplementation((event, handler) => {
        if (event === "notification:mark-read") {
          markReadHandler = handler;
        }
        return mockSocket;
      });

      mockOnConnection(mockSocket);

      // ==================== Act ====================
      markReadHandler!(mockNotificationId);

      // ==================== Assert Process ====================
      // 1. verify notification counts updated event was emitted
      expect(mockSocket.to).toHaveBeenCalledWith(`user:${mockUserId}`);
      expect(mockSocket.emit).toHaveBeenCalledWith("notification:counts_updated", 0);
    });

    it("should handle notification delete event", () => {
      // ==================== Arrange ====================
      let deleteHandler: Function;
      mockSocket.on.mockImplementation((event, handler) => {
        if (event === "notification:delete") {
          deleteHandler = handler;
        }
        return mockSocket;
      });

      mockOnConnection(mockSocket);

      // ==================== Act ====================
      deleteHandler!(mockNotificationId);

      // ==================== Assert Process ====================
      // 1. verify notification info event was emitted
      expect(mockSocket.to).toHaveBeenCalledWith(`user:${mockUserId}`);
      expect(mockSocket.emit).toHaveBeenCalledWith("notification:info");
    });

    it("should handle notification mark-read event error", () => {
      // ==================== Arrange ====================
      let markReadHandler: Function;
      mockSocket.on.mockImplementation((event, handler) => {
        if (event === "notification:mark-read") {
          markReadHandler = handler;
        }
        return mockSocket;
      });

      // Mock socket.to to throw an error
      mockSocket.to.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      mockOnConnection(mockSocket);

      // ==================== Act ====================
      markReadHandler!(mockNotificationId);

      // ==================== Assert Process ====================
      // 1. verify error was emitted to client
      expect(mockSocket.emit).toHaveBeenCalledWith("error", {
        message: "Failed to mark notification as read and return new notification counts",
      });
    });

    it("should handle notification delete event error", () => {
      // ==================== Arrange ====================
      let deleteHandler: Function;
      mockSocket.on.mockImplementation((event, handler) => {
        if (event === "notification:delete") {
          deleteHandler = handler;
        }
        return mockSocket;
      });

      // Mock socket.to to throw an error
      mockSocket.to.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      mockOnConnection(mockSocket);

      // ==================== Act ====================
      deleteHandler!(mockNotificationId);

      // ==================== Assert Process ====================
      // 1. verify error was emitted to client
      expect(mockSocket.emit).toHaveBeenCalledWith("error", {
        message: "Failed to delete notification",
      });
    });

    it("should handle socket disconnect event", () => {
      // ==================== Arrange ====================
      let disconnectHandler: Function;
      mockSocket.on.mockImplementation((event, handler) => {
        if (event === "disconnect") {
          disconnectHandler = handler;
        }
        return mockSocket;
      });

      mockOnConnection(mockSocket);

      const disconnectReason = "client disconnect";

      // ==================== Act ====================
      disconnectHandler!(disconnectReason);

      // ==================== Assert Process ====================
      // 1. verify disconnect log
      expect(mockConsoleLog).toHaveBeenCalledWith(
        `🔌 Socket disconnected: ${mockUserId} (${disconnectReason})`
      );
    });
  });

  describe("getSocketServer", () => {
    it("should return socket server after initialization", () => {
      // ==================== Arrange ====================
      initializeSocket(mockServer);

      // ==================== Act ====================
      const result = getSocketServer();

      // ==================== Assert Process ====================
      expect(result).toBe(mockSocketIO);
    });

    it("should return same socket server instance on multiple calls", () => {
      // ==================== Arrange ====================
      initializeSocket(mockServer);

      // ==================== Act ====================
      const result1 = getSocketServer();
      const result2 = getSocketServer();

      // ==================== Assert Process ====================
      expect(result1).toBe(result2);
      expect(result1).toBe(mockSocketIO);
    });

    it("should throw error when socket server is not initialized", () => {
      // ==================== Arrange ====================
      // Clear the module cache to reset the internal socket variable
      jest.resetModules();

      // Re-import the module to get a fresh instance
      const { getSocketServer } = require("../../../src/config/socket.config");

      // ==================== Act & Assert ====================
      expect(() => getSocketServer()).toThrow("Socket.IO server has not been initialized");
    });
  });

  describe("Cookie Token Parsing", () => {
    beforeEach(() => {
      initializeSocket(mockServer);
    });

    it("should parse token from complex cookie string", async () => {
      // ==================== Arrange ====================
      const mockPayload = { userId: mockUserId, sessionId: mockSessionId };
      mockVerifyToken.mockResolvedValue({ payload: mockPayload });

      const complexCookieSocket = {
        ...mockSocket,
        handshake: {
          auth: {},
          headers: {
            cookie: `sessionId=abc123; accessToken=${mockToken}; refreshToken=xyz789; Path=/`,
          },
        },
      };

      const mockNext = jest.fn();

      // ==================== Act ====================
      await mockMiddleware(complexCookieSocket, mockNext);

      // ==================== Assert Process ====================
      // 1. verify correct token was extracted and verified
      expect(mockVerifyToken).toHaveBeenCalledWith(mockToken, {
        secret: AccessTokenSignOptions.secret,
      });

      // 2. verify authentication success
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle malformed cookie strings gracefully", async () => {
      // ==================== Arrange ====================
      const malformedCookieSocket = {
        ...mockSocket,
        handshake: {
          auth: {},
          headers: {
            cookie: "malformed-cookie-string",
          },
        },
      };

      const mockNext = jest.fn();

      // ==================== Act ====================
      await mockMiddleware(malformedCookieSocket, mockNext);

      // ==================== Assert Process ====================
      // 1. verify authentication failed due to no token
      expect(mockNext).toHaveBeenCalledWith(new Error("No token provided"));

      // 2. verify no token verification occurred
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it("should handle cookie with accessToken but no value", async () => {
      // ==================== Arrange ====================
      const emptyTokenCookieSocket = {
        ...mockSocket,
        handshake: {
          auth: {},
          headers: {
            cookie: "accessToken=; Path=/",
          },
        },
      };

      const mockNext = jest.fn();

      // ==================== Act ====================
      await mockMiddleware(emptyTokenCookieSocket, mockNext);

      // ==================== Assert Process ====================
      // 1. verify authentication failed due to empty token
      expect(mockNext).toHaveBeenCalledWith(new Error("No token provided"));

      // 2. verify no token verification occurred
      expect(mockVerifyToken).not.toHaveBeenCalled();
    });

    it("should handle cookie with accessToken= but no actual token", async () => {
      // ==================== Arrange ====================
      const partialTokenCookieSocket = {
        ...mockSocket,
        handshake: {
          auth: {},
          headers: {
            cookie: "accessToken=abc; Path=/",
          },
        },
      };

      const mockNext = jest.fn();

      // ==================== Act ====================
      await mockMiddleware(partialTokenCookieSocket, mockNext);

      // ==================== Assert Process ====================
      // 1. verify token verification was attempted with partial token
      expect(mockVerifyToken).toHaveBeenCalledWith("abc", {
        secret: AccessTokenSignOptions.secret,
      });
    });
  });
});
