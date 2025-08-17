import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";

import Icon from "./react-icons.component";

interface PlayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPlaying: boolean;
}

const PlayButton = forwardRef<HTMLButtonElement, PlayButtonProps>(
  ({ isPlaying, onClick, className, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
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
        <Icon name={isPlaying ? BsPauseFill : BsPlayFill} opts={{ size: 30, color: "black" }} />
      </button>
    );
  }
);

export default PlayButton;
