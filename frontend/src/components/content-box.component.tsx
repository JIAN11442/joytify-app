import { twMerge } from "tailwind-merge";

type ContentBoxProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

const ContentBox: React.FC<ContentBoxProps> = ({ children, style, className }) => {
  return (
    <div
      style={style}
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
