import { twMerge } from "tailwind-merge";

interface NoDataMessageProps {
  message: string;
  className?: string;
}

const NoDataMessage: React.FC<NoDataMessageProps> = ({
  message,
  className,
}) => {
  return (
    <div
      className={twMerge(
        `
          w-full
          mt-4
          p-3
          rounded-full
          bg-neutral-800
          text-center
          text-grey-custom/30
        `,
        className
      )}
    >
      <p className="truncate">{message}</p>
    </div>
  );
};

export default NoDataMessage;
