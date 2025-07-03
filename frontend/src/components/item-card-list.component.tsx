import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";

type ItemCardListProps = {
  children: React.ReactNode;
  title?: { content: string; progress: boolean };
  pagination: { to: string; count: number; total: number; label: string };
  className?: string;
  tw?: {
    title?: string;
    list?: string;
  };
};

const ItemCardList: React.FC<ItemCardListProps> = ({
  children,
  title,
  pagination,
  className,
  tw,
}) => {
  const { content, progress } = title ?? {};
  const { to, count, total, label } = pagination;

  const isPaginationEnabled = count < total;

  return (
    <div
      className={twMerge(
        `
          flex
          flex-col
          gap-3
          w-full
        `,
        className
      )}
    >
      {/* title & see more */}
      <div
        className={`
          flex
          items-end
          justify-between
        `}
      >
        {/* title */}
        {title && (
          <h1
            className={twMerge(
              `
                flex
                items-center
                gap-1
                pl-3
                text-2xl
                font-bold
              `,
              tw?.title
            )}
          >
            {content}
            {progress && (
              <span className="text-xl text-neutral-100/30">
                ({count}/{total})
              </span>
            )}
          </h1>
        )}

        {/* see more */}
        {isPaginationEnabled && (
          <Link
            to={to}
            className={`
              text-sm
              text-neutral-100/30
              hover:text-neutral-100/50
              hover:scale-105
              transition
            `}
          >
            <span>{label}</span>
          </Link>
        )}
      </div>

      {/* items list */}
      <div
        className={twMerge(
          `
            flex
            gap-1
            overflow-y-hidden
            overflow-x-auto
            whitespace-nowrap
            snap-x
            snap-mandatory
            hidden-scrollbar
          `,
          tw?.list
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default ItemCardList;
