import AuthGuardLink from "./auth-guard-link.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";

type HomepageSectionListProps = {
  fm: ScopedFormatMessage;
  title: string;
  description?: string;
  pagination: { to: string; count: number; total: number };
  children?: React.ReactNode;
};

const HomepageSectionList: React.FC<HomepageSectionListProps> = ({
  fm,
  title,
  description,
  pagination,
  children,
}) => {
  const { to, count, total } = pagination;
  const isPaginationEnabled = count < total;

  const homepageSectionFm = fm(`homepage.section`);

  return (
    <div className={`flex flex-col gap-5`}>
      {/* title & description & pagination */}
      <div
        className={`
          flex 
          items-end 
          justify-between
        `}
      >
        {/* title & description */}
        <div className={`flex flex-col gap-1`}>
          <p className={`text-2xl font-bold`}>{title}</p>
          {description && <p className={`text-xs text-neutral-400`}>{description}</p>}
        </div>

        {/* pagination */}
        {isPaginationEnabled && (
          <AuthGuardLink
            to={to}
            className={`
              text-sm
              text-neutral-100/30
              hover:text-neutral-100/50
              hover:scale-105
              transition
            `}
          >
            {homepageSectionFm("more")}
          </AuthGuardLink>
        )}
      </div>

      {/* children */}
      {children}
    </div>
  );
};

export default HomepageSectionList;
