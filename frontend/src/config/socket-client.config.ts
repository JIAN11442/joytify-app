import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocketClient = (): Socket => {
  if (socket) return socket;

  const serverUrl = import.meta.env.VITE_SERVER_URL;

  socket = io(serverUrl, {
    withCredentials: true,
    // reconnection settings
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason: string) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  socket.on("error", (error: Error) => {
    console.error("🔴 Socket error:", error);
  });

  return socket;
};

export const getSocketClient = (): Socket | null => {
  return socket;
};

export const disconnectSocketClient = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
