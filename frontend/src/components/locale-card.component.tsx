import { ButtonHTMLAttributes } from "react";
import { LocaleMapFields } from "../contents/locale.content";
import { twMerge } from "tailwind-merge";

interface LocaleCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  localeInfo: LocaleMapFields;
  children?: React.ReactNode;
  className?: string;
  tw?: {
    flag?: string;
    content?: string;
    display?: string;
    native?: string;
  };
}

const LocaleCard: React.FC<LocaleCardProps> = ({
  localeInfo,
  children,
  className,
  tw,
  ...props
}) => {
  const { flag, display, native } = localeInfo;

  return (
    <button
      type="button"
      {...props}
      className={twMerge(
        `
        relative
        flex
        w-full
        min-w-[250px]
        p-4
        gap-4
        border
        border-neutral-800
        shadow-[0_0_5px_0_rgba(0,0,0,0.5)]
        items-center
        rounded-lg
        transition-all
        ease-in-out
      `,
        className
      )}
    >
      {/* flag */}
      <div
        className={twMerge(
          `
          flex
          px-2
          py-1
          bg-black/20
          rounded-md
          items-center
          justify-center
          text-4xl
        `,
          tw?.flag
        )}
      >
        {flag}
      </div>

      {/* display title */}
      <p
        className={twMerge(
          `
          flex
          flex-col
          w-full
          gap-1
          text-left
        `,
          tw?.content
        )}
      >
        <span className={twMerge(`text-base font-bold line-clamp-1`, tw?.display)}>{display}</span>
        <span className={twMerge(`text-sm text-neutral-500`, tw?.native)}>{native}</span>
      </p>

      {/* children */}
      {children}
    </button>
  );
};

export default LocaleCard;
