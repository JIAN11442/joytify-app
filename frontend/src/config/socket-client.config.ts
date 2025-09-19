import { io, Socket, ManagerOptions, SocketOptions } from "socket.io-client";

let socket: Socket | null = null;

// Safely get access token from cookies
const getAccessToken = (): string | null => {
  try {
    const cookies = document.cookie.split(';');
    const accessTokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('accessToken=')
    );
    return accessTokenCookie ? decodeURIComponent(accessTokenCookie.split('=')[1]) : null;
  } catch (error) {
    console.warn('Failed to get access token from cookie:', error);
    return null;
  }
};

export const initializeSocketClient = (): Socket => {
  if (socket) return socket;

  const serverUrl = import.meta.env.VITE_SERVER_URL;
  
  // Get token but don't fail if it's not available
  const accessToken = getAccessToken();
  
  const socketConfig: Partial<ManagerOptions & SocketOptions> = {
    withCredentials: true,
    // Force WebSocket transport to avoid polling authentication issues
    transports: ['websocket'],
    // reconnection settings
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  };

  // Only add auth if we have a token
  if (accessToken) {
    socketConfig.auth = { token: accessToken };
  }

  socket = io(serverUrl, socketConfig);

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
