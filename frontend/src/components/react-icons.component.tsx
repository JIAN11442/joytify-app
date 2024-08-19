import { IconBaseProps, IconType } from "react-icons";

type IconProps = {
  name: IconType;
  opts?: IconBaseProps;
  className?: string;
};

const Icon: React.FC<IconProps> = ({ name: Icon, opts, className }) => {
  return <Icon {...opts} className={className} />;
};

export default Icon;
