import { twMerge } from "tailwind-merge";
import { IconBaseProps } from "react-icons";
import { GoInfo } from "react-icons/go";
import { IoClose } from "react-icons/io5";

import AnimationWrapper, {
  DefaultAnimationWrapperProps,
} from "./animation-wrapper.component";
import Icon, { IconName } from "./react-icons.component";

interface WarningMsgBoxProps extends DefaultAnimationWrapperProps {
  warningMsg: string | React.ReactNode;
  headerIcon?: { name: IconName; opts?: IconBaseProps };
  closeIcon?: { name: IconName; opts?: IconBaseProps };
  tw?: {
    wrapper?: string;
    hdrIcon?: string;
    clsIcon?: string;
    msg?: string;
    clsBtn?: string;
  };
}

const WarningMsgBox: React.FC<WarningMsgBoxProps> = ({
  warningMsg,
  headerIcon,
  closeIcon,
  tw,
  ...props
}) => {
  const defaultInfoIcon = {
    name: GoInfo,
    opts: { color: "#fdba74", size: 18 },
  };

  const defaultCloseIcon = {
    name: IoClose,
    opts: { color: "#fdba74" },
  };

  const infoIcon = { ...defaultInfoIcon, ...headerIcon };
  const closeBtnIcon = { ...defaultCloseIcon, closeIcon };

  return (
    <AnimationWrapper
      {...props}
      className={twMerge(
        `
          relative
          flex
          w-full
          py-5
          pl-3
          ${!tw?.clsBtn?.includes("hidden") ? "pr-5" : "pr-3"}
          my-5
          gap-3
          items-start
          bg-orange-200/10
          shadow-[1px_0px_10px_1px]
          shadow-orange-300/5
          border-l-2
          border-orange-300
        `,
        tw?.wrapper
      )}
    >
      {/* Icon */}
      <div>
        <Icon {...infoIcon} className={tw?.hdrIcon} />
      </div>

      {/* Warning message */}
      <p
        className={twMerge(
          `
            text-sm
            text-start
            text-orange-300 
          `,
          tw?.msg
        )}
      >
        {warningMsg}
      </p>

      {/* Close button */}
      <button
        type="button"
        className={twMerge(
          `
            absolute 
            right-3
            opacity-50
            hover:opacity-80
            transition  
          `,
          tw?.clsBtn
        )}
      >
        <Icon {...closeBtnIcon} className={tw?.clsIcon} />
      </button>
    </AnimationWrapper>
  );
};

export default WarningMsgBox;
