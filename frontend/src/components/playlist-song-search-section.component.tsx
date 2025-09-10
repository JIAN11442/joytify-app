import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useInView } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { FormattedMessage } from "react-intl";
import Icon from "./react-icons.component";
import InputBox from "./input-box.component";
import AnimationWrapper from "./animation-wrapper.component";
import SongRecommendationTableList from "./song-recommendation-table-list.component";
import { useGetQuerySongsQuery } from "../hooks/song-query.hook";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { RefactorPlaylistResponse } from "@joytify/types/types";

type PlaylistSongSearchSectionProps = {
  fm: ScopedFormatMessage;
  playlist: RefactorPlaylistResponse;
  onClose: () => void;
  className?: string;
  tw?: { closeBtn?: string };
};

const PlaylistSongSearchSection: React.FC<PlaylistSongSearchSectionProps> = ({
  fm,
  playlist,
  onClose,
  className,
  tw,
}) => {
  const { _id: playlistId } = playlist;

  const [searchQuery, setSearchQuery] = useState("");

  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-200px" });
  const { songs, isLoading } = useGetQuerySongsQuery(searchQuery, playlistId);

  const prefix = "playlist.songSearch.section";
  const playlistSongSearchSectionFm = fm(prefix);

  const hasSearchQuery = searchQuery.length > 0;

  const NoFoundMessage = () => {
    return (
      <p
        className={`
          py-10
          text-[14px]
          text-center
          text-neutral-500
          tracking-widest
        `}
      >
        <FormattedMessage
          id={`${prefix}.noFound`}
          values={{
            searchQuery: searchQuery,
            strong: (chunks) => <strong className={`text-neutral-300`}>{chunks}</strong>,
          }}
        />
      </p>
    );
  };

  // reset search query when playlist id changes
  useEffect(() => {
    setSearchQuery("");
  }, [playlistId]);

  return (
    <AnimationWrapper
      ref={ref}
      initial={{ opacity: 0, y: -10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={twMerge("flex flex-col gap-5", className)}
    >
      {/* divider */}
      <div className={`relative`}>
        <hr className={`divider -mt-3`} />

        <button
          type="button"
          onClick={onClose}
          className={twMerge(
            `
            absolute
            -bottom-5
            right-0
            p-2
            text-neutral-500
            hover:bg-neutral-400/10
            hover:text-neutral-400
            hover:scale-110
            rounded-full
            transition-all
          `,
            tw?.closeBtn
          )}
        >
          <Icon name={IoMdClose} opts={{ size: 15 }} />
        </button>
      </div>

      {/* title & description */}
      <div className={`flex flex-col gap-5`}>
        <h1 className={`text-xl font-bold`}>{playlistSongSearchSectionFm("title")}</h1>

        <InputBox
          placeholder={playlistSongSearchSectionFm("searchbar.placeholder")}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          className={`max-w-[500px] bg-neutral-400/10`}
        />
      </div>

      {/* recommended song table list */}
      {hasSearchQuery && (
        <SongRecommendationTableList
          songs={songs}
          playlist={playlist}
          isLoading={isLoading}
          noFoundMessage={<NoFoundMessage />}
        />
      )}
    </AnimationWrapper>
  );
};

export default PlaylistSongSearchSection;
