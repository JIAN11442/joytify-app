import { useEffect } from "react";
import useProviderState from "../states/provider.state";

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

    const timeout = setTimeout(() => {
      window.addEventListener("resize", handleResize);
    }, 0);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <>{children}</>;
};

export default ScreenMonitor;
