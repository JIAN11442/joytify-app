import toast from "react-hot-toast";
import WarningIcon from "../components/warning-icon.component";

declare module "react-hot-toast" {
  interface Toast {
    warning: (message: string) => string;
  }
}

// expand toast function
const enhancedToast = toast as typeof toast & {
  warning: (message: string) => string;
};

// adding warning method
enhancedToast.warning = (message: string) => {
  return toast(message, {
    icon: <WarningIcon />,
  });
};

export default enhancedToast;
