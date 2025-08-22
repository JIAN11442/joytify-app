import { useParams, useSearchParams } from "react-router-dom";
import SearchFilterPanel from "../components/search-filter-panel.component";
import SearchFilterContent from "../components/search-filter-content.component";
import { SearchFilterOptions } from "@joytify/shared-types/constants";
import { SearchFilterType } from "@joytify/shared-types/types";
import { useScopedIntl } from "../hooks/intl.hook";

const SearchPage = () => {
  const { fm } = useScopedIntl();

  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";

  const searchFilter = type as SearchFilterType;

  const { ALL } = SearchFilterOptions;

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(
          to bottom,
          rgb(243 244 246 / 0.05) 0%,
          #171717 25%
        )`,
      }}
      className={`page-container`}
    >
      {/* filter panel */}
      <SearchFilterPanel
        urlSearchFilter={searchFilter}
        searchQuery={searchQuery}
        className={`${type === ALL ? "mb-8" : "mb-3"}`}
      />

      {/* item list */}
      <SearchFilterContent fm={fm} searchFilter={searchFilter} searchQuery={searchQuery} />
    </div>
  );
};

export default SearchPage;
