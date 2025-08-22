import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../components/loader.component";
import SongTableList from "../components/song-table-list.component";
import PlaylistHeroSection from "../components/playlist-hero-section.component";
import PlaylistActionPanel from "../components/playlist-action-panel.component";
import PlaylistSongSearchSection from "../components/playlist-song-search-section.component";
import PlaylistRecommendedSection from "../components/playlist-recommended-section.component";
import { useGetPlaylistByIdQuery } from "../hooks/playlist-query.hook";
import { useGetRecommendedSongsQuery } from "../hooks/song-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";
import { timeoutForDelay } from "../lib/timeout.lib";

const PlaylistPage = () => {
  const { id } = useParams();
  const { fm } = useScopedIntl();
  const { playlist } = useGetPlaylistByIdQuery(String(id));
  const { recommendedSongs, isLoading } = useGetRecommendedSongsQuery(String(id));

  const [activeSearchSection, setActiveSearchSection] = useState(false);

  const handleShowSearchSection = () => {
    timeoutForDelay(() => {
      setActiveSearchSection(true);
    });
  };

  const handleCloseSearchSection = () => {
    timeoutForDelay(() => {
      setActiveSearchSection(false);
    });
  };

  // reset active search section when playlist id changes
  useEffect(() => {
    setActiveSearchSection(false);
  }, [id]);

  if (!playlist) {
    return <Loader className={{ container: "h-full" }} />;
  }

  const { paletee, songs } = playlist;
  const noSongYet = !songs || songs.length === 0;
  const hasSongs = songs && songs.length > 0;
  const hasRecommendedSongs = recommendedSongs && recommendedSongs.length > 0;
  const showSongSearchSection = noSongYet || activeSearchSection;
  const showToggleBtn = hasSongs && !activeSearchSection;

  const playlistToggleBtnFm = fm("playlist.toggleButton");

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(
          to bottom,
          ${paletee?.vibrant} 0%,
          ${paletee?.darkVibrant} 40%,
          #171717 70%
        )`,
      }}
      className={`h-full pt-10 overflow-x-hidden rounded-b-none`}
    >
      {/* hero section */}
      <PlaylistHeroSection fm={fm} playlist={playlist} />

      {/* content section */}
      <div
        className={`
          flex
          flex-1
          flex-col
          mt-10
          p-6
          gap-5
          w-full
          bg-gradient-to-b
          from-neutral-900/20
          to-neutral-900  
        `}
      >
        {/* action panel */}
        <PlaylistActionPanel fm={fm} playlist={playlist} />

        {/* song list */}
        <div className={`relative`}>
          <SongTableList
            fm={fm}
            songs={songs}
            paletee={paletee}
            className={`${noSongYet ? "mb-10" : "mb-16"}`}
          />

          {showToggleBtn && (
            <button
              type="button"
              onClick={handleShowSearchSection}
              className={`
                absolute
                bottom-0
                right-0
                text-sm
                text-neutral-500
                hover:text-neutral-400
                transition-all
            `}
            >
              {playlistToggleBtnFm("show")}
            </button>
          )}
        </div>

        {/* playlist song search section */}
        {showSongSearchSection && (
          <PlaylistSongSearchSection
            fm={fm}
            playlist={playlist}
            onClose={handleCloseSearchSection}
            className={`pb-16`}
            tw={{ closeBtn: `${noSongYet && "hidden"}` }}
          />
        )}

        {/* recommended song section */}
        {hasRecommendedSongs && (
          <PlaylistRecommendedSection
            fm={fm}
            songs={recommendedSongs}
            playlist={playlist}
            isLoading={isLoading}
            className={`mb-8`}
          />
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;
