import { ScopedFormatMessage } from "../hooks/intl.hook";
import { RefactorSongResponse } from "@joytify/shared-types/types";
import { formatPlaybackDuration } from "../utils/unit-format.util";
import { IntlShape } from "react-intl";
import { getDuration } from "../utils/get-time.util";

type SongCardDetailsField = {
  id: string;
  title: string;
  value: string | number;
};

export const getManageSongCardDetailsContent = (
  fm: ScopedFormatMessage,
  intl: IntlShape,
  song: RefactorSongResponse
): SongCardDetailsField[] => {
  const manageSongsListDetailsFm = fm("manage.songs.list.details");

  const fields = [
    {
      id: "song-details-title",
      title: manageSongsListDetailsFm("title"),
      value: song.title || "N/A",
    },
    {
      id: "song-details-artist",
      title: manageSongsListDetailsFm("artist"),
      value: song.artist || "N/A",
    },
    {
      id: "song-details-composer",
      title: manageSongsListDetailsFm("composer"),
      value: song.composers || "N/A",
    },
    {
      id: "song-details-lyricist",
      title: manageSongsListDetailsFm("lyricist"),
      value: song.lyricists || "N/A",
    },
    {
      id: "song-details-album",
      title: manageSongsListDetailsFm("album"),
      value: song.album || "N/A",
    },
    {
      id: "song-details-duration",
      title: manageSongsListDetailsFm("duration"),
      value: getDuration(song.duration) || "N/A",
    },
    {
      id: "song-details-language",
      title: manageSongsListDetailsFm("language"),
      value: song.languages || "N/A",
    },
    {
      id: "song-details-release-date",
      title: manageSongsListDetailsFm("releaseDate"),
      value:
        intl.formatDate(song.releaseDate, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }) || "N/A",
    },
    {
      id: "song-details-playback-duration-total",
      title: manageSongsListDetailsFm("playbackDuration.total"),
      value: formatPlaybackDuration(song.activities.totalPlaybackDuration) || "N/A",
    },
    {
      id: "song-details-playback-duration-weighted",
      title: manageSongsListDetailsFm("playbackDuration.weighted"),
      value: formatPlaybackDuration(song.activities.weightedAveragePlaybackDuration) || "N/A",
    },
  ];

  return fields;
};
