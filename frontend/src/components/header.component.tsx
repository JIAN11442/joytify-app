import { twMerge } from "tailwind-merge";
import Icon from "./react-icons.component";
import { IoIosMenu } from "react-icons/io";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import useSidebarState from "../states/sidebar.state";

type HeaderProps = {
  children: React.ReactNode;
  className?: string;
};

const Header: React.FC<HeaderProps> = ({ children, className }) => {
  const navigate = useNavigate();

  const { floating, setFloating } = useSidebarState();

  const handleActiveFloatSidebar = () => {
    const timeout = setTimeout(() => {
      setFloating(!floating);
    }, 0);

    return () => clearTimeout(timeout);
  };

  return (
    <div
      className={twMerge(
        `
          h-fit
          p-6
          bg-gradient-to-b
          from-emerald-800
          to-neutral-900
          rounded-lg
      `,
        className
      )}
    >
      {/*  Navigate to the previous or forward page (appears when screen size is greater than 'sm') */}
      <div
        className={`
          gap-3
          hidden
          sm:flex
        `}
      >
        {/* Navigate back */}
        <div>
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
        </div>

        {/* Navigate forword */}
        <div>
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
      </div>

      {/* Menu (appears when screen size is lower than 'sm') */}
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
    </div>
  );
};

export default Header;
