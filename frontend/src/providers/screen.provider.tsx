import { useEffect } from "react";
import useProviderState from "../states/provider.state";
import { timeoutForEventListener } from "../lib/timeout.lib";

type ScreenMonitorProps = {
  children: React.ReactNode;
};

const ScreenMonitor: React.FC<ScreenMonitorProps> = ({ children }) => {
  const { setScreenWidth, setScreenHeight } = useProviderState();

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };

    handleResize();

    timeoutForEventListener(window, "resize", handleResize, 0);
  }, []);

  return <>{children}</>;
};

export default ScreenMonitor;
