import { useState, useMemo } from "react";
import { BiSearch } from "react-icons/bi";
import { TbPlaylist } from "react-icons/tb";

import SearchBarInput from "../components/searchbar-input.component";
import AnimationWrapper from "../components/animation-wrapper.component";
import PageSectionTitle from "../components/page-section-title.component";
import ManagePlaylistsControlPanel from "../components/manage-playlists-control-panel.component";
import ManagePlaylistsCardList from "../components/manage-playlists-card-list.component";
import { OnChangeProps } from "../components/manage-playlists-control-panel.component";
import { useGetPlaylistsQuery } from "../hooks/playlist-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import { ManagePlaylistsArrangement } from "../constants/manage.constant";
import { ManagePlaylistsArrangementType } from "../types/manage.type";
import { PlaylistResponse } from "@joytify/shared-types/types";
import { timeoutForDelay } from "../lib/timeout.lib";

const ManagePlaylistsPage = () => {
  const { fm } = useScopedIntl();
  const managePlaylistsFm = fm("manage.playlists");

  const { GRID } = ManagePlaylistsArrangement;

  const [searchQuery, setSearchQuery] = useState("");
  const [arrangement, setArrangement] = useState<ManagePlaylistsArrangementType>(GRID);
  const [filteredPlaylists, setFilteredPlaylists] = useState<PlaylistResponse[]>([]);

  const { playlists, isPending } = useGetPlaylistsQuery();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    timeoutForDelay(() => {
      setSearchQuery(e.target.value);
    });
  };

  const handleControlPanelOnChange = (props: OnChangeProps) => {
    timeoutForDelay(() => {
      const { playlists, arrangement } = props;

      setFilteredPlaylists(playlists);
      setArrangement(arrangement);
    });
  };

  // Apply search filter to the filtered playlists from control panel
  const finalPlaylists = useMemo(() => {
    if (!searchQuery) return filteredPlaylists;

    return filteredPlaylists.filter((playlist) =>
      playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredPlaylists, searchQuery]);

  return (
    <div className={`page-container`}>
      {/* title & searchbar */}
      <AnimationWrapper initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        {/* title */}
        <PageSectionTitle
          icon={{ name: TbPlaylist }}
          title={managePlaylistsFm("title")}
          description={managePlaylistsFm("description")}
        />

        {/* searchbar */}
        <SearchBarInput
          id="manage-playlists-searchbar"
          placeholder={managePlaylistsFm("searchbar.placeholder")}
          icon={{ name: BiSearch, opts: { size: 22 } }}
          onChange={handleSearchChange}
          autoComplete="off"
          className={`py-5 my-4`}
        />
      </AnimationWrapper>

      {/* filter & actions */}
      <AnimationWrapper initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <ManagePlaylistsControlPanel
          fm={fm}
          playlists={playlists}
          initialArrangement={arrangement}
          onControlPanelChange={handleControlPanelOnChange}
        />
      </AnimationWrapper>

      {/* playlists display */}
      <AnimationWrapper initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <ManagePlaylistsCardList
          fm={fm}
          playlists={finalPlaylists}
          arrangement={arrangement}
          isPending={isPending}
        />
      </AnimationWrapper>
    </div>
  );
};

export default ManagePlaylistsPage;
