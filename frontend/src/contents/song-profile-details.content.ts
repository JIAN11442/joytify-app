import { IntlShape } from "react-intl";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { SongProfileDetailsOptions } from "@joytify/shared-types/constants";
import { RefactorSongResponse, SongProfileDetailsType } from "@joytify/shared-types/types";
import { formatPlaybackDuration } from "../utils/unit-format.util";
import { getDuration } from "../utils/get-time.util";

type SongProfileDetailsItem = {
  id: string;
  title: string;
  value: string | number;
};

type SongProfileDetailsField = {
  id: string;
  key: SongProfileDetailsType;
  title: string;
  items: SongProfileDetailsItem[];
};

type SongProfileDetailsContent = {
  basicInfoField: SongProfileDetailsField;
  statsInfoField: SongProfileDetailsField;
};

export const getSongProfileDetailsContent = (
  fm: ScopedFormatMessage,
  intl: IntlShape,
  song: RefactorSongResponse
): SongProfileDetailsContent => {
  const songDetailsFm = fm("song.details");

  const { BASIC_INFO, STATS_INFO } = SongProfileDetailsOptions;

  return {
    basicInfoField: {
      id: "song-profile-detail-basic-info",
      key: BASIC_INFO,
      title: songDetailsFm("label.basicInfo"),
      items: [
        {
          id: "basic-info-title",
          title: songDetailsFm("title"),
          value: song.title || "N/A",
        },
        {
          id: "basic-info-artist",
          title: songDetailsFm("artist"),
          value: song.artist || "N/A",
        },
        {
          id: "basic-info-composer",
          title: songDetailsFm("composer"),
          value: song.composers || "N/A",
        },
        {
          id: "basic-info-lyricist",
          title: songDetailsFm("lyricist"),
          value: song.lyricists || "N/A",
        },
        {
          id: "basic-info-album",
          title: songDetailsFm("album"),
          value: song.album || "N/A",
        },
        {
          id: "basic-info-duration",
          title: songDetailsFm("duration"),
          value: getDuration(song.duration) || "N/A",
        },
        {
          id: "basic-info-language",
          title: songDetailsFm("language"),
          value: song.languages || "N/A",
        },
        {
          id: "basic-info-release-date",
          title: songDetailsFm("releaseDate"),
          value:
            intl.formatDate(song.releaseDate, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }) || "N/A",
        },
      ],
    },
    statsInfoField: {
      id: "song-profile-detail-stats-info",
      key: STATS_INFO,
      title: songDetailsFm("label.statsInfo"),
      items: [
        {
          id: "stats-info-total-rating-count",
          title: songDetailsFm("rating.count.total"),
          value: song.activities.totalRatingCount || "N/A",
        },
        {
          id: "stats-info-average-rating",
          title: songDetailsFm("rating.count.average"),
          value: song.activities.averageRating || "N/A",
        },
        {
          id: "stats-info-total-playback-count",
          title: songDetailsFm("total.playback.count"),
          value: song.activities.totalPlaybackCount || "N/A",
        },
        {
          id: "stats-info-total-playback-duration",
          title: songDetailsFm("total.playback.duration"),
          value: formatPlaybackDuration(song.activities.totalPlaybackDuration) || "N/A",
        },
        {
          id: "stats-info-weighted-average-playback-duration",
          title: songDetailsFm("weighted.average.playback.duration"),
          value: formatPlaybackDuration(song.activities.weightedAveragePlaybackDuration) || "N/A",
        },
      ],
    },
  };
};
