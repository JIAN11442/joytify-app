import { BiSearch } from "react-icons/bi";
import { BsPeople } from "react-icons/bs";
import SearchBarInput from "../components/searchbar-input.component";
import AnimationWrapper from "../components/animation-wrapper.component";
import PageSectionTitle from "../components/page-section-title.component";
import ManageFollowingList from "../components/manage-following-list.component";
import { useGetFollowingMusiciansQuery } from "../hooks/musician-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import { useMemo, useState } from "react";
import { timeoutForDelay } from "../lib/timeout.lib";

const ManageFollowingPage = () => {
  const { fm } = useScopedIntl();
  const manageFollowingFm = fm("manage.following");

  const [searchQuery, setSearchQuery] = useState("");

  const { musicians, isPending } = useGetFollowingMusiciansQuery();

  const handleOnChangeSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    timeoutForDelay(() => {
      setSearchQuery(e.target.value);
    });
  };

  const filteredMusicians = useMemo(() => {
    if (!musicians) return;

    const lowerSearchQuery = searchQuery.toLowerCase();
    const filteredMusicians =
      musicians.filter(
        (musician) =>
          musician.name.toLowerCase().includes(lowerSearchQuery) ||
          musician.roles.some((role) => role.toLowerCase().includes(lowerSearchQuery))
      ) || musicians;

    return filteredMusicians;
  }, [musicians, searchQuery]);

  return (
    <div className={`settings-page-container`}>
      <AnimationWrapper initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        {/* title */}
        <PageSectionTitle
          icon={{ name: BsPeople }}
          title={manageFollowingFm("title")}
          description={manageFollowingFm("description")}
        />

        {/* searchbar */}
        <SearchBarInput
          id="manage-following-searchbar"
          placeholder={manageFollowingFm("searchbar.placeholder")}
          icon={{ name: BiSearch, opts: { size: 22 } }}
          onChange={handleOnChangeSearchBar}
          autoComplete="off"
          className={`py-5 my-4`}
        />
      </AnimationWrapper>

      {/* following artist card */}
      <AnimationWrapper
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1 }}
        className={`-mt-5 h-full`}
      >
        <ManageFollowingList
          fm={fm}
          musicians={musicians}
          filteredMusicians={filteredMusicians}
          searchQuery={searchQuery}
          isPending={isPending}
        />
      </AnimationWrapper>
    </div>
  );
};

export default ManageFollowingPage;
