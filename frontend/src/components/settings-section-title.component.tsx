import { IconBaseProps, IconType } from "react-icons";
import Icon from "./react-icons.component";
import { twMerge } from "tailwind-merge";

type SettingSectionTitleProps = {
  icon: { name: IconType; opts?: IconBaseProps };
  title: string;
  description?: string;
  className?: string;
  tw?: {
    icon?: string;
    title?: string;
    description?: string;
  };
};

const SettingSectionTitle: React.FC<SettingSectionTitleProps> = ({
  icon,
  title,
  description,
  className,
  tw,
}) => {
  const iconSize = icon?.opts?.size ?? 30;

  return (
    <div
      className={twMerge(
        `
        flex 
        items-center 
        gap-5
        mb-3
      `,
        className
      )}
    >
      {/* icon */}
      <div
        className={twMerge(
          `
          p-3 
          bg-neutral-500/50
          rounded-full
          `,
          tw?.icon
        )}
      >
        <Icon name={icon.name} opts={{ size: iconSize, ...icon?.opts }} />
      </div>

      {/* content */}
      <p className={`flex flex-col gap-1 line-clamp-1`}>
        {/* title */}
        <span
          className={twMerge(
            `
            max-md:text-xl
            md:text-2xl
            font-bold
          `,
            tw?.title
          )}
        >
          {title}
        </span>

        {/* description */}
        <span
          className={twMerge(
            `
            max-md:text-sm
            md:text-base
            text-neutral-500
          `,
            tw?.description
          )}
        >
          {description}
        </span>
      </p>
    </div>
  );
};

export default SettingSectionTitle;
