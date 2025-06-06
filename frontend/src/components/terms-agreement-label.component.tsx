import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface TermsAgreementLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  children: React.ReactNode;
  tw?: {
    label?: string;
    input?: string;
  };
}

const TermsAgreementLabel = forwardRef<HTMLInputElement, TermsAgreementLabelProps>(
  ({ children, tw, ...props }, ref) => {
    return (
      <label
        className={twMerge(
          `
            group
            flex 
            gap-3
            mb-4
            p-3
            items-start
            rounded-md
            cursor-pointer
            transition-all
          `,
          tw?.label
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          {...props}
          className={twMerge(
            `
              mt-[2px]
              w-5 
              h-5
              accent-green-500
            `,
            tw?.input
          )}
        />
        {children}
      </label>
    );
  }
);

export default TermsAgreementLabel;
