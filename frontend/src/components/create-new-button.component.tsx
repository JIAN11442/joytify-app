import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { IconBaseProps } from "react-icons";
import { AiOutlinePlus } from "react-icons/ai";
import Icon, { IconName } from "./react-icons.component";

interface CreateNewBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: { name?: IconName; opts?: IconBaseProps };
  tw?: { icon?: string };
}

const CreateNewBtn = forwardRef<HTMLButtonElement, CreateNewBtnProps>(
  ({ type, icon, className, children, tw, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={twMerge(
          `
            group
            flex
            px-2
            py-[1.5px]
            gap-2
            text-sm
            text-green-500/50
            hover:text-green-500
            items-center
            transition
        `,
          className
        )}
        {...props}
      >
        <Icon
          name={AiOutlinePlus || icon?.name}
          opts={{ size: 12, ...icon?.opts }}
          className={twMerge(
            `
            p-0.5
            rounded-full
            text-black
            bg-green-500/50
            group-hover:bg-green-500
            `,
            tw?.icon
          )}
        />
        {children}
      </button>
    );
  }
);

export default CreateNewBtn;
