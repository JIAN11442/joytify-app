import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { useScopedIntl } from "../hooks/intl.hook";
import { getSearchFilterPanelContent } from "../contents/search-filter-panel.content";
import { SearchFilterType } from "@joytify/types/types";
import { timeoutForDelay } from "../lib/timeout.lib";
import { navigate } from "../lib/navigate.lib";

type FilterPanelProps = {
  urlSearchFilter: SearchFilterType;
  searchQuery: string;
  className?: string;
  tw?: { filterBtn?: string };
};

const SearchFilterPanel: React.FC<FilterPanelProps> = ({
  urlSearchFilter,
  searchQuery,
  className,
  tw,
}) => {
  const { fm } = useScopedIntl();
  const filterField = getSearchFilterPanelContent(fm);

  const handleNavigateToTargetFilter = useCallback(
    (key: SearchFilterType) => {
      const baseUrl = `/search/${key}`;
      const query =
        searchQuery && searchQuery.length > 0 ? `?q=${encodeURIComponent(searchQuery)}` : "";

      timeoutForDelay(() => {
        navigate(`${baseUrl}${query}`);
      });
    },
    [searchQuery]
  );

  return (
    <div
      className={twMerge(
        `
          flex
          flex-wrap
          gap-3
        `,
        className
      )}
    >
      {filterField.map((item) => {
        const { id, key, title } = item;

        return (
          <button
            key={id}
            onClick={() => handleNavigateToTargetFilter(key)}
            className={twMerge(
              `
                py-2
                px-4
                control-panel-btn
                ${
                  urlSearchFilter === key
                    ? "control-panel-selected"
                    : `bg-neutral-200/10 hover:bg-neutral-100/20`
                }
                rounded-full
                transition-all
              `,
              tw?.filterBtn
            )}
          >
            {title}
          </button>
        );
      })}
    </div>
  );
};

export default SearchFilterPanel;
