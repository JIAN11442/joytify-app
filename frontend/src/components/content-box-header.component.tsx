import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router-dom";
import { IoIosMenu } from "react-icons/io";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

import Icon from "./react-icons.component";
import AuthOperation from "./auth-operation.component";

import useSidebarState from "../states/sidebar.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type ContentBoxHeaderProps = {
  children: React.ReactNode;
  options?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

const ContentBoxHeader: React.FC<ContentBoxHeaderProps> = ({
  children,
  options = true,
  style,
  className,
}) => {
  const navigate = useNavigate();

  const { floating, setFloating } = useSidebarState();

  // handle active float sidebar
  const handleActiveFloatSidebar = () => {
    timeoutForDelay(() => {
      setFloating(!floating);
    });
  };

  return (
    <div
      style={style}
      className={twMerge(
        `
          flex
          flex-col
          h-fit
          rounded-lg
      `,
        className
      )}
    >
      {/* header */}
      <div
        className={`
          mb-4
          items-center
          justify-between
          ${options ? "flex" : "hidden"}
        `}
      >
        {/* Left side: Navigate page (appears when screen size is greater than 'sm') */}
        <div
          className={`
            gap-3
            hidden
            sm:flex
          `}
        >
          {/* Navigate back */}
          <button
            onClick={() => navigate(-1)}
            className={`
              p-3
              bg-black/50
              rounded-full
              hover:opacity-80
              hover:scale-110
              transition
            `}
          >
            <Icon name={FaAngleLeft} opts={{ size: 20 }} />
          </button>

          {/* Navigate forword */}
          <button
            onClick={() => navigate(1)}
            className={`
              p-3
              bg-black/50
              rounded-full
              hover:opacity-80
              hover:scale-110
              transition
            `}
          >
            <Icon name={FaAngleRight} opts={{ size: 20 }} />
          </button>
        </div>

        {/* Left side: Menu (appears when screen size is lower than 'sm') */}
        <button
          onClick={handleActiveFloatSidebar}
          className={`
            p-3
            rounded-full
            bg-black/50
            hover:scale-110
            transition
            hidden
            max-sm:block
          `}
        >
          <Icon name={IoIosMenu} opts={{ size: 20 }} />
        </button>

        {/* Right side */}
        <AuthOperation />
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
};

export default ContentBoxHeader;
