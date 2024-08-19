import { twMerge } from "tailwind-merge";

type ContentBoxProps = {
  children: React.ReactNode;
  className?: string;
};

const ContentBox: React.FC<ContentBoxProps> = ({ children, className }) => {
  return (
    <div
      className={twMerge(
        `
          w-full
          h-fit
          rounded-lg
          bg-neutral-900
        `,
        className
      )}
    >
      {children}
    </div>
  );
};

export default ContentBox;
