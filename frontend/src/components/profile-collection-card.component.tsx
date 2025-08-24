import { ButtonHTMLAttributes } from "react";
import { Link, LinkProps } from "react-router-dom";
import { twMerge } from "tailwind-merge";

interface CollectionCardBaseProps {
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

type CollectionCardProps =
  | (CollectionCardBaseProps & LinkProps & { to: string; onClick?: never })
  | (CollectionCardBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: never });

const ProfileCollectionCard: React.FC<CollectionCardProps> = ({
  to,
  title,
  imageUrl,
  description,
  className,
  tw,
  ...props
}) => {
  const children = (
    <>
      {/* image */}
      <img
        alt="item-card-image"
        src={imageUrl}
        className={twMerge(`object-cover aspect-square`, tw?.img)}
      />

      <div className={`flex flex-col pl-1`}>
        {/* title */}
        <h3
          className={twMerge(
            `
              text-sm 
              font-medium 
              text-neutral-400
              line-clamp-1
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
                truncate
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
      <Link
        {...(props as LinkProps)}
        to={to}
        className={twMerge("grid-card-wrapper card-size--base", className)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      type="button"
      className={twMerge("grid-card-wrapper card-size--base", className)}
    >
      {children}
    </button>
  );
};

export default ProfileCollectionCard;
