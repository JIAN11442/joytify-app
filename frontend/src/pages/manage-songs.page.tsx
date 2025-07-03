import { useMemo, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { CiMusicNote1 } from "react-icons/ci";

import SearchBarInput from "../components/searchbar-input.component";
import ManageSongsList from "../components/manage-songs-list.component";
import AnimationWrapper from "../components/animation-wrapper.component";
import PageSectionTitle from "../components/page-section-title.component";
import ManageSongsOverview from "../components/manage-songs-overview.component";
import { useGetUserSongsQuery, useGetUserSongStatsQuery } from "../hooks/song-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import { timeoutForDelay } from "../lib/timeout.lib";

const ManageSongsPage = () => {
  const { fm } = useScopedIntl();
  const manageSongsFm = fm("manage.songs");

  const [searchQuery, setSearchQuery] = useState("");

  const { songs, isPending: userSongsPending } = useGetUserSongsQuery();
  const { songStats, isPending: songStatsPending } = useGetUserSongStatsQuery();

  const handleOnChangeSearchBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    timeoutForDelay(() => {
      setSearchQuery(e.target.value);
    });
  };

  const filteredSongs = useMemo(() => {
    if (!songs) return;

    const lowerSearchQuery = searchQuery.toLowerCase();
    const filteredSongs =
      songs.filter(
        (song) =>
          song.title.toLowerCase().includes(lowerSearchQuery) ||
          song.artist.toLowerCase().includes(lowerSearchQuery)
      ) || songs;

    return filteredSongs;
  }, [songs, searchQuery]);

  return (
    <div className={`settings-page-container`}>
      {/* title & searchbar */}
      <AnimationWrapper initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        {/* title */}
        <PageSectionTitle
          icon={{ name: CiMusicNote1 }}
          title={manageSongsFm("title")}
          description={manageSongsFm("description")}
        />

        {/* searchbar */}
        <SearchBarInput
          id="manage-songs-searchbar"
          placeholder={manageSongsFm("searchbar.placeholder")}
          icon={{ name: BiSearch, opts: { size: 22 } }}
          onChange={handleOnChangeSearchBar}
          autoComplete="off"
          className={`py-5 my-4`}
        />
      </AnimationWrapper>

      {/* overview */}
      <AnimationWrapper initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <ManageSongsOverview stats={songStats} isPending={songStatsPending} />
      </AnimationWrapper>

      {/* songs card */}
      <AnimationWrapper
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`h-full`}
      >
        <ManageSongsList
          fm={fm}
          songs={songs}
          filteredSongs={filteredSongs}
          searchQuery={searchQuery}
          isPending={userSongsPending}
        />
      </AnimationWrapper>
    </div>
  );
};

export default ManageSongsPage;
