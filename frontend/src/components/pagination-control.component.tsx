import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { timeoutForDelay } from "../lib/timeout.lib";

type PaginationControlProps = {
  fm: ScopedFormatMessage;
  totalDocs: number;
  currentPage: number;
  currentDocsLength: number;
  pageControl: {
    page: number;
    setPage: (page: number) => void;
  };
  loadMoreTitle?: string;
  loadLessTitle?: string;
  children?: React.ReactNode;
  className?: string;
  tw?: {
    loadWrapper?: string;
  };
};

const PaginationControl: React.FC<PaginationControlProps> = ({
  fm,
  totalDocs,
  currentPage,
  currentDocsLength,
  pageControl,
  loadMoreTitle,
  loadLessTitle,
  children,
  className,
  tw,
}) => {
  const paginationFm = fm("pagination");

  const { page, setPage } = pageControl;

  const isLoadMore = totalDocs && totalDocs > currentDocsLength;
  const isLoadLess = currentPage > 1 && currentDocsLength > 0;

  const handleLoadMore = useCallback(() => {
    timeoutForDelay(() => {
      setPage(page + 1);
    });
  }, [page, setPage]);

  const handleLoadLess = useCallback(() => {
    timeoutForDelay(() => {
      setPage(page - 1);
    });
  }, [page, setPage]);

  if (!isLoadMore && !isLoadLess) return null;

  return (
    <div className={twMerge(`flex flex-col gap-5`, className)}>
      {/* loading component */}
      {children}

      {/* load buttons */}
      <div
        className={twMerge(
          `
            flex 
            w-full 
            gap-10
            mb-8
            items-center 
            justify-center
          `,
          tw?.loadWrapper
        )}
      >
        {/* load more */}
        {isLoadMore && (
          <button className={`load-btn`} onClick={handleLoadMore}>
            {loadMoreTitle || paginationFm("loadMore")}
          </button>
        )}

        {/* load less */}
        {isLoadLess && (
          <button className={`load-btn`} onClick={handleLoadLess}>
            {loadLessTitle || paginationFm("loadLess")}
          </button>
        )}
      </div>
    </div>
  );
};

export default PaginationControl;
