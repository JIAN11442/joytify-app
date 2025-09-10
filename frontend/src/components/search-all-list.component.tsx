import SearchItemList from "./search-item-list.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { SearchAllResponse, SearchFilterType } from "@joytify/types/types";

type SearchAllListProps = {
  fm: ScopedFormatMessage;
  docs: SearchAllResponse;
  searchQuery: string;
};

const SearchAllList: React.FC<SearchAllListProps> = ({ fm, docs, searchQuery }) => {
  const searchFilterTypeFm = fm("search.filterType");

  return (
    <div
      className={`
        flex 
        flex-col 
        gap-10
      `}
    >
      {Object.entries(docs).map(([key, items]) => {
        return (
          <div
            key={`search-item-list-${key}`}
            className={`
              flex 
              flex-col 
              gap-3
            `}
          >
            <p className={`text-2xl pl-3 font-bold`}>{searchFilterTypeFm(key)}</p>
            <SearchItemList
              fm={fm}
              type={key as SearchFilterType}
              items={items}
              searchQuery={searchQuery}
            />
          </div>
        );
      })}
    </div>
  );
};

export default SearchAllList;
