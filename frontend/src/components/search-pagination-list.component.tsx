import { twMerge } from "tailwind-merge";
import Loader from "./loader.component";
import PaginationControl from "./pagination-control.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";

type SearchPaginationListProps = {
  fm: ScopedFormatMessage;
  totalDocs: number;
  currentPage: number;
  currentDocsLength: number;
  pageControl: {
    page: number;
    setPage: (page: number) => void;
  };
  isFetching?: boolean;
  divider?: boolean;
  children?: React.ReactNode;
  className?: string;
  tw?: {
    divider?: string;
    pagination?: string;
  };
};

const SearchPaginationList: React.FC<SearchPaginationListProps> = ({
  fm,
  totalDocs,
  currentPage,
  currentDocsLength,
  pageControl,
  isFetching = false,
  divider = true,
  children,
  className,
  tw,
}) => {
  return (
    <div className={twMerge(`flex flex-col gap-5`, className)}>
      {children}

      {isFetching && <Loader loader={{ name: "BeatLoader", size: 12 }} />}

      <PaginationControl
        fm={fm}
        totalDocs={totalDocs}
        currentPage={currentPage}
        currentDocsLength={currentDocsLength}
        pageControl={pageControl}
        className={tw?.pagination}
      >
        {divider && <hr className={twMerge(`divider`, tw?.divider)} />}
      </PaginationControl>
    </div>
  );
};

export default SearchPaginationList;
