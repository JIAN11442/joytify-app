import { useEffect } from "react";
import {
  getSocketClient,
  initializeSocketClient,
  disconnectSocketClient,
} from "../config/socket-client.config";
import useUserState from "../states/user.state";
import { setupSocketClientEvents } from "../lib/socket-client.lib";

type SocketClientProviderProps = {
  children: React.ReactNode;
};

const SocketClientProvider: React.FC<SocketClientProviderProps> = ({ children }) => {
  const { authUser } = useUserState();

  useEffect(() => {
    if (authUser) {
      // 1. initialize socket client
      const socket = initializeSocketClient();

      // 2. socket event handler
      setupSocketClientEvents(socket);

      // 3. cleanup function while component unmount or authUser change
      return () => {
        console.log("🔌 Cleaning up socket connection");
        disconnectSocketClient();
      };
    } else {
      // 3. disconnect socket client
      const existingSocket = getSocketClient();

      if (existingSocket) {
        console.log("🔌 Disconnecting socket - no authenticated user");
        disconnectSocketClient();
      }
    }
  }, [authUser]);

  return <>{children}</>;
};

export default SocketClientProvider;
