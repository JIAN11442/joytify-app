import Loader from "./loader.component";
import PlaylistItem from "./playlist-item.component";
import useSidebarState from "../states/sidebar.state";
import { usePlaylists } from "../hooks/playlist.hook";
import AnimationWrapper from "./animation-wrapper.component";

const LibraryPlaylist = () => {
  const { playlists, isLoading: isPlaylistLoading } = usePlaylists();

  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  return (
    <>
      {isPlaylistLoading ? (
        <Loader />
      ) : playlists?.length ? (
        <div
          className={`
            flex
            flex-col
            ${isCollapsed ? "gap-y-3" : "gap-y-1"}
          `}
        >
          {playlists.map((playlist, index) => (
            <AnimationWrapper
              key={playlist._id}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <PlaylistItem playlist={playlist} />
            </AnimationWrapper>
          ))}
        </div>
      ) : (
        // login but no playlist
        <>
          {!isCollapsed && (
            <div
              className={`
                pt-5
                pr-2
                text-neutral-500
                font-semibold
              `}
            >
              <p className="mb-4">
                You haven't created any playlist or song here yet.
              </p>
              <p>
                Click the " + " button in the upper right corner to upload your
                own favourite song or playlist.
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default LibraryPlaylist;
