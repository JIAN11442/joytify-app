import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { IoIosClose } from "react-icons/io";
import Icon from "./react-icons.component";
import { Label } from "../constants/axios-response.constant";

interface CheckBoxItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  opt: Label;
  deleteFunc: () => void;
  tw?: {
    input?: string;
    title?: string;
    deleteBtn?: string;
    icon?: string;
  };
}

const OptionCheckboxItem = forwardRef<HTMLInputElement, CheckBoxItemProps>(
  ({ opt, deleteFunc, tw, className, ...props }, ref) => {
    return (
      <label
        className={twMerge(
          `
            group
            flex
            gap-2
            px-2
            py-[1.5px]
            items-center
          `,
          className
        )}
      >
        {/* input */}
        <input ref={ref} type="checkbox" name={opt.label} {...props} />

        {/* title */}
        <p
          className={twMerge(
            `
              text-sm
              capitalize
              text-neutral-400
              group-hover:text-white
            `,
            tw?.title
          )}
        >
          {opt.label}
        </p>

        {/* delete button */}
        <button type="button" onClick={deleteFunc} className={tw?.deleteBtn}>
          <Icon
            name={IoIosClose}
            opts={{ size: 18 }}
            className={twMerge(
              `
                text-red-500
                hover:bg-red-500
                hover:text-white
                rounded-full
                transition
              `,
              tw?.icon
            )}
          />
        </button>
      </label>
    );
  }
);

export default OptionCheckboxItem;
