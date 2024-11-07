import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { AiOutlinePlus } from "react-icons/ai";
import Icon from "./react-icons.component";

interface CreateNewBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  tailwindCSS?: { wrapper?: string; icon?: string };
}

const CreateNewBtn = forwardRef<HTMLButtonElement, CreateNewBtnProps>(
  ({ type, children, tailwindCSS, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={twMerge(
          `
            group
            flex
            px-2
            gap-3
            text-sm
            text-green-500/50
            hover:text-green-500
            items-center
            transition
        `,
          tailwindCSS?.wrapper
        )}
        {...props}
      >
        <Icon
          name={AiOutlinePlus}
          opts={{ size: 12 }}
          className={twMerge(
            `
            p-0.5
            rounded-full
            text-black
            bg-green-500/50
            group-hover:bg-green-500
            `,
            tailwindCSS?.icon
          )}
        />
        {children}
      </button>
    );
  }
);

export default CreateNewBtn;
