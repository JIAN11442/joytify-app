import Loader from "./loader.component";
import PlaylistItem from "./playlist-item.component";
import AnimationWrapper from "./animation-wrapper.component";
import { useGetPlaylistsQuery } from "../hooks/playlist-query.hook";
import useSidebarState from "../states/sidebar.state";
import useLibraryState from "../states/library.state";

const LibraryPlaylist = () => {
  const { librarySearchVal } = useLibraryState();
  const { playlists, isLoading: isPlaylistLoading } = useGetPlaylistsQuery(librarySearchVal);

  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  if (isPlaylistLoading) {
    return <Loader />;
  }

  if (librarySearchVal && !playlists?.length) {
    return (
      <div
        className={`
          p-3
          text-neutral-500
          font-semibold
        `}
      >
        <p className="mb-2">
          Could not find playlist with title{" "}
          <span className={`text-white`}>&quot;{librarySearchVal}&quot;</span>
        </p>
        <p>Please try searching again with different spellings or keywords</p>
      </div>
    );
  }

  if (!playlists) {
    return (
      !isCollapsed && (
        <div
          className={`
            pt-5 
            pr-2
            text-neutral-500
            font-semibold
        `}
        >
          <p className="mb-4">You haven't created any playlist or song here yet.</p>
          <p>
            Click the " + " button in the upper right corner to upload your own favourite song or
            playlist.
          </p>
        </div>
      )
    );
  }

  return (
    <div className={`flex flex-col ${isCollapsed ? "gap-y-3" : "gap-y-1"}`}>
      {playlists.map((playlist, index) => (
        <AnimationWrapper key={playlist._id} transition={{ duration: 0.3, delay: index * 0.2 }}>
          <PlaylistItem playlist={playlist} />
        </AnimationWrapper>
      ))}
    </div>
  );
};

export default LibraryPlaylist;
