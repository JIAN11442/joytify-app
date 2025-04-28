import { FaInfo } from "react-icons/fa";
import Icon from "./react-icons.component";
import AnimationWrapper from "./animation-wrapper.component";

const WarningIcon = () => {
  return (
    <AnimationWrapper
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        flex
        items-center
        justify-center
        w-fit
        p-1.5
        rounded-full
        bg-orange-400
      `}
    >
      <AnimationWrapper
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Icon name={FaInfo} className={`text-[11px] text-white`} />
      </AnimationWrapper>
    </AnimationWrapper>
  );
};

export default WarningIcon;
