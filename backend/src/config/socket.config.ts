import { Socket, Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

import { ORIGIN_APP } from "../constants/env-validate.constant";
import { AccessTokenSignOptions, verifyToken } from "../utils/jwt.util";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  sessionId?: string;
}

export const initializeSocket = (server: HTTPServer) => {
  try {
    // 1. initialize socket server
    const io = new SocketIOServer(server, {
      cors: { origin: ORIGIN_APP, methods: ["GET", "POST"], credentials: true },
    });

    // 2. authenticate socket connection
    io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        // a. get token from handshake by client
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.cookie?.split("accessToken=")[1]?.split(";")[0];

        // b. if no token, throw error
        if (!token) {
          return next(new Error("No token provided"));
        }

        // c. verify token
        const { payload } = await verifyToken(token, {
          secret: AccessTokenSignOptions.secret,
        });

        // d. if no payload, throw error
        if (!payload) {
          return next(new Error("Invalid token"));
        }

        // e. set user id and session id
        socket.userId = payload.userId as string;
        socket.sessionId = payload.sessionId as string;

        // f. log
        console.log(`🔐 Socket authenticated: ${socket.userId}`);
        next();
      } catch (error) {
        console.error("🔴 Socket authentication error:", error);
        next(new Error("Authentication failed"));
      }
    });

    // 3. handle socket connection
    io.on("connection", (socket: AuthenticatedSocket) => {
      console.log(`🔌 Socket connected: ${socket.userId} (${socket.id})`);

      // a. create user room while client user's socket connect to server(logged in)
      socket.join(`user:${socket.userId}`);

      // b. mark read handler
      socket.on("notification:mark-read", async (notificationId: string) => {
        try {
          // mark notification as read API

          // get user notification counts
          const newCounts = 0;

          // emit notification read event or counts to client
          socket.to(`user:${socket.userId}`).emit("notification:counts_updated", newCounts);
        } catch (error) {
          socket.emit("error", {
            message: "Failed to mark notification as read and return new notification counts",
          });
        }
      });

      // c. delete notification handler
      socket.on("notification:delete", async (notificationId: string) => {
        try {
          // delete notification API

          // emit new notification info to client
          socket.to(`user:${socket.userId}`).emit("notification:info");
        } catch (error) {
          socket.emit("error", { message: "Failed to delete notification" });
        }
      });

      // d. disconnect handler
      socket.on("disconnect", (reason) => {
        console.log(`🔌 Socket disconnected: ${socket.userId} (${reason})`);
      });
    });

    console.log(`✅ Socket.io server initialized successfully`);
  } catch (error) {
    console.error("🔴 Socket.io server initialization failed:", error);
    throw error;
  }
};
