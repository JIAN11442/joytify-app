import { IconBaseProps, IconType } from "react-icons";
import * as Ri from "react-icons/ri";
import * as Md from "react-icons/md";
import * as Fa from "react-icons/fa";
import * as Ai from "react-icons/ai";
import * as Bs from "react-icons/bs";
import * as Bi from "react-icons/bi";
import * as Fi from "react-icons/fi";
import * as Gi from "react-icons/gi";
import * as Hi from "react-icons/hi";
import * as Im from "react-icons/im";
import * as Io from "react-icons/io";
import * as Io5 from "react-icons/io5";
import * as Ti from "react-icons/ti";
import * as Tb from "react-icons/tb";
import * as Wi from "react-icons/wi";
import * as Si from "react-icons/si";
import * as Sl from "react-icons/sl";
import * as Vsc from "react-icons/vsc";
import * as Cg from "react-icons/cg";
import * as Lu from "react-icons/lu";
import * as Pi from "react-icons/pi";
import * as Go from "react-icons/go";

const IconModules = {
  Ri,
  Md,
  Fa,
  Ai,
  Bs,
  Bi,
  Fi,
  Gi,
  Hi,
  Im,
  Io,
  Io5,
  Ti,
  Tb,
  Wi,
  Si,
  Sl,
  Vsc,
  Cg,
  Lu,
  Pi,
  Go,
};

export type IconName = keyof typeof IconModules | IconType;

type IconProps = {
  name: IconName;
  opts?: IconBaseProps;
  style?: React.CSSProperties;
  className?: string;
};

const Icon: React.FC<IconProps> = ({ name, opts, style, className }) => {
  let IconComponent: IconType;

  if (typeof name === "string") {
    const [prefix, iconName] = name.split(/(?=[A-Z])/);
    const module = IconModules[prefix as keyof typeof IconModules];

    IconComponent = module[iconName as keyof typeof module] as IconType;

    if (!IconComponent) {
      console.warn(`Icon ${name} not found`);
      return null;
    }
  } else {
    IconComponent = name;
  }

  return <IconComponent {...opts} className={className} style={style} />;
};

export default Icon;
