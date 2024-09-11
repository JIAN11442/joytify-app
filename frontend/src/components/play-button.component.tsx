import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";

import Icon from "./react-icons.component";

type PlayButtonProps = {
  onClick?: () => void;
  isPlaying: boolean;
  className?: string;
};

const PlayButton = forwardRef<HTMLButtonElement, PlayButtonProps>(
  ({ isPlaying, onClick, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={twMerge(
          `
            flex
            p-4
            bg-green-500
            hover:bg-green-400
            hover:scale-105
            rounded-full
            transition
          `,
          className
        )}
        {...props}
      >
        <Icon
          name={isPlaying ? BsPauseFill : BsPlayFill}
          opts={{ size: 30, color: "black" }}
        />
      </button>
    );
  }
);

export default PlayButton;
