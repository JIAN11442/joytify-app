import { useCallback } from "react";
import { TbPlaylistAdd } from "react-icons/tb";
import Loader from "./loader.component";
import Icon from "./react-icons.component";
import SongTitleItem from "./song-title-item.component";
import AuthGuardLink from "./auth-guard-link.component";
import { useAssignSongToPlaylistsMutation } from "../hooks/song-mutate.hook";
import { RefactorPlaylistResponse, RefactorSongResponse } from "@joytify/types/types";
import useSidebarState from "../states/sidebar.state";
import createColorStyle from "../utils/create-color-style.util";

type SongRecommendationTableListProps = {
  songs?: RefactorSongResponse[];
  playlist: RefactorPlaylistResponse;
  isLoading?: boolean;
  noFoundMessage?: string | React.ReactNode;
};

const SongRecommendationTableList: React.FC<SongRecommendationTableListProps> = ({
  songs,
  playlist,
  isLoading,
  noFoundMessage,
}) => {
  const { _id: playlistId, paletee, songs: playlistSongs } = playlist;

  const { collapseSideBarState } = useSidebarState();
  const { mutate: assignSongToPlaylistsFn } = useAssignSongToPlaylistsMutation(undefined, false);

  const handleAssignSongToPlaylist = (songId: string) => {
    assignSongToPlaylistsFn({
      songId,
      playlistsToAdd: [playlistId],
      playlistsToRemove: [],
    });
  };

  const getColorStyle = useCallback(
    (cssVar: string, opacity?: number) => {
      return createColorStyle(cssVar, paletee?.vibrant, opacity);
    },
    [paletee]
  );

  if (isLoading) {
    return <Loader loader={{ name: "BeatLoader", size: 12 }} />;
  }

  if (!songs || songs.length === 0) {
    return <>{noFoundMessage}</>;
  }

  const { isCollapsed } = collapseSideBarState;

  return (
    <table>
      <tbody>
        {songs.map((song, index) => {
          const { _id: songId, title, imageUrl, artist, album } = song;
          const { name: artistName } = artist;
          const { _id: albumId, title: albumTitle } = album || {};

          const onClick = () => handleAssignSongToPlaylist(songId);

          const showAssignBtn = !playlistSongs.some((s) => s._id === songId);

          return (
            <tr
              key={`song-recommendation-${index}`}
              style={{
                ...getColorStyle("--bg-hover-color", 0.2),
                ...getColorStyle("--hover-color"),
              }}
              className={`
                text-sm
                font-light
                text-grey-custom/60
                hover:bg-[var(--bg-hover-color)]
                transition-all
              `}
            >
              {/* song title */}
              <td className={`pl-2.5 rounded-l-md`}>
                <SongTitleItem
                  title={title}
                  imageUrl={imageUrl}
                  artist={artistName}
                  switchFunc={false}
                />
              </td>

              {/* album */}
              <td
                style={{ filter: "brightness(1.5)" }}
                className={`
                  ${isCollapsed ? "max-sm:hidden" : "max-md:hidden"}
                `}
              >
                {albumTitle && albumId ? (
                  <AuthGuardLink
                    to={`/album/${albumId}`}
                    onClick={(e) => e.stopPropagation()}
                    className={`underline hover:text-[var(--hover-color)] transition-all`}
                  >
                    {albumTitle}
                  </AuthGuardLink>
                ) : (
                  "--"
                )}
              </td>

              {/* actions */}
              <td style={{ filter: "brightness(1.5)" }} className={`max-w-[50px] rounded-r-md`}>
                <div className={`flex items-center justify-end`}>
                  {showAssignBtn && (
                    <button
                      type="button"
                      onClick={onClick}
                      className={`
                        p-2
                        hover:text-[var(--hover-color)]
                        hover:scale-110
                        transition-all
                      `}
                    >
                      <Icon name={TbPlaylistAdd} opts={{ size: 25 }} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default SongRecommendationTableList;
