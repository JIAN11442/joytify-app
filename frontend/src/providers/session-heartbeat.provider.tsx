import { useEffect } from "react";
import { useTouchSessionHeartBeatMutation } from "../hooks/session-mutate.hook";
import useUserState from "../states/user.state";

type SessionHeartBeatProps = {
  children: React.ReactNode;
};

const SessionHeartBeatProvider: React.FC<SessionHeartBeatProps> = ({ children }) => {
  const { authUser } = useUserState();
  const { mutate: touchSessionHeartBeat } = useTouchSessionHeartBeatMutation();

  const HEARTBEAT_INTERVAL = import.meta.env.VITE_HEARTBEAT_THRESHOLD * 1000 * 60;

  useEffect(() => {
    if (!authUser) return;

    // Immediately trigger the heartbeat
    touchSessionHeartBeat();

    const interval = setInterval(() => {
      touchSessionHeartBeat();
    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(interval);
  }, [authUser, touchSessionHeartBeat]);

  return <>{children}</>;
};

export default SessionHeartBeatProvider;
