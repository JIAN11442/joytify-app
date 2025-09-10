import { twMerge } from "tailwind-merge";
import { IoIosClose } from "react-icons/io";
import Icon from "./react-icons.component";
import CheckboxLabel from "./checkbox-label.component";
import { Label } from "@joytify/types/types";

interface CheckBoxItemProps {
  opt: Label;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  deleteFunc: () => void;
  tw?: {
    input?: string;
    title?: string;
    deleteBtn?: string;
    icon?: string;
  };
}

const OptionCheckboxItem: React.FC<CheckBoxItemProps> = ({ opt, deleteFunc, tw, ...props }) => {
  return (
    <CheckboxLabel
      tw={{ label: `px-2 py-[1.5px] gap-2 items-center`, input: `w-3.2 h-3.2` }}
      {...props}
    >
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
    </CheckboxLabel>
  );
};

export default OptionCheckboxItem;
