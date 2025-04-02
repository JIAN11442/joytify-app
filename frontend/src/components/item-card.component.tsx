import { ButtonHTMLAttributes } from "react";
import { Link, LinkProps } from "react-router-dom";
import { twMerge } from "tailwind-merge";

interface ItemCardBaseProps {
  title: string;
  imageUrl: string;
  description?: string;
  className?: string;
  tw?: {
    img?: string;
    title?: string;
    description?: string;
  };
}

type ItemCardProps =
  | (ItemCardBaseProps & LinkProps & { to: string; onClick?: never })
  | (ItemCardBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: never });

const ItemCard: React.FC<ItemCardProps> = ({
  to,
  title,
  imageUrl,
  description,
  className,
  tw,
  ...props
}) => {
  const containerClassName = twMerge(
    `
      flex
      flex-col
      h-fit
      p-2
      gap-2
      shrink-0
      text-left
      hover:bg-neutral-500/20
      rounded-md
      cursor-pointer
      transition-all
      hover:shadow-[0px_0px_5px_rgba(0,0,0,0.5)]
      hover:shadow-neutral-900/50
  `,
    className
  );

  const children = (
    <>
      {/* image */}
      <img
        alt="item-card-image"
        src={imageUrl}
        className={twMerge(
          `
            w-[150px]
            object-cover
            aspect-square
          `,
          tw?.img
        )}
      />

      <div className={`flex flex-col pl-1`}>
        {/* title */}
        <h3
          className={twMerge(
            `
              text-sm
              font-bold
              text-neutral-300
              truncate
            `,
            tw?.title
          )}
        >
          {title}
        </h3>

        {/* description */}
        {description && (
          <p
            className={twMerge(
              `
                text-sm
                text-neutral-100/30
              `,
              tw?.description
            )}
          >
            {description}
          </p>
        )}
      </div>
    </>
  );

  if (to) {
    return (
      <Link {...(props as LinkProps)} to={to} className={containerClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      type="button"
      className={containerClassName}
    >
      {children}
    </button>
  );
};

export default ItemCard;
