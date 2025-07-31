import { IntlShape } from "react-intl";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { RefactorSongResponse } from "@joytify/shared-types/types";
import { formatPlaybackDuration } from "../utils/unit-format.util";
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
  const songDetailsFm = fm("song.details");

  const fields = [
    {
      id: "song-details-title",
      title: songDetailsFm("title"),
      value: song.title || "N/A",
    },
    {
      id: "song-details-artist",
      title: songDetailsFm("artist"),
      value: song.artist || "N/A",
    },
    {
      id: "song-details-composer",
      title: songDetailsFm("composer"),
      value: song.composers || "N/A",
    },
    {
      id: "song-details-lyricist",
      title: songDetailsFm("lyricist"),
      value: song.lyricists || "N/A",
    },
    {
      id: "song-details-album",
      title: songDetailsFm("album"),
      value: song.album || "N/A",
    },
    {
      id: "song-details-duration",
      title: songDetailsFm("duration"),
      value: getDuration(song.duration) || "N/A",
    },
    {
      id: "song-details-language",
      title: songDetailsFm("language"),
      value: song.languages || "N/A",
    },
    {
      id: "song-details-release-date",
      title: songDetailsFm("releaseDate"),
      value:
        intl.formatDate(song.releaseDate, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }) || "N/A",
    },
    {
      id: "song-details-total-playback-duration",
      title: songDetailsFm("total.playback.duration"),
      value:
        formatPlaybackDuration({ fm, duration: song.activities.totalPlaybackDuration }) || "N/A",
    },
    {
      id: "song-details-weighted-average-playback-duration",
      title: songDetailsFm("weighted.average.playback.duration"),
      value:
        formatPlaybackDuration({ fm, duration: song.activities.weightedAveragePlaybackDuration }) ||
        "N/A",
    },
  ];

  return fields;
};
