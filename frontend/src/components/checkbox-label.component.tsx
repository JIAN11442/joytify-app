import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface CheckboxLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  children: React.ReactNode;
  tw?: {
    label?: string;
    input?: string;
  };
}

const CheckboxLabel = forwardRef<HTMLInputElement, CheckboxLabelProps>(
  ({ children, tw, ...props }, ref) => {
    return (
      <label
        className={twMerge(
          `
            group
            flex 
            gap-2
            items-start
            rounded-md
            cursor-pointer
            transition-all
          `,
          tw?.label
        )}
      >
        <input ref={ref} type="checkbox" {...props} className={twMerge(`w-5 h-5`, tw?.input)} />
        {children}
      </label>
    );
  }
);

export default CheckboxLabel;
