import { useEffect } from "react";
import useProviderState from "../states/provider.state";
import { timeoutForEventListener } from "../lib/timeout.lib";

type ScreenMonitorProps = {
  children: React.ReactNode;
};

const ScreenMonitorProvider: React.FC<ScreenMonitorProps> = ({ children }) => {
  const { setScreenWidth, setScreenHeight } = useProviderState();

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
    };

    handleResize();

    return timeoutForEventListener(window, "resize", handleResize);
  }, []);

  return <>{children}</>;
};

export default ScreenMonitorProvider;
