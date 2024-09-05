import { FaPlay } from "react-icons/fa6";
import Icon from "./react-icons.component";
import { twMerge } from "tailwind-merge";

type PlayButtonProps = {
  className?: string;
};

const PlayButton: React.FC<PlayButtonProps> = ({ className }) => {
  return (
    <button
      className={twMerge(
        `
          flex
          p-5
          bg-green-500
          hover:bg-green-400
          hover:scale-105
          rounded-full
          transition
        `,
        className
      )}
    >
      <Icon name={FaPlay} opts={{ size: 20, color: "black" }} />
    </button>
  );
};

export default PlayButton;
