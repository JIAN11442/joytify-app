import { ScopedFormatMessage } from "../hooks/intl.hook";
import { formatPlaybackCount, formatPlaybackDuration } from "../utils/unit-format.util";

type ManageSongsOverviewField = {
  id: string;
  key: string;
  title: string;
  unitFormatFn?: (duration: number) => string;
};

export const getManageSongsOverviewContent = (
  fm: ScopedFormatMessage
): ManageSongsOverviewField[] => {
  const manageSongsOverviewFm = fm("manage.songs.overview");

  const fields = [
    {
      id: "overview-total-songs",
      key: "totalSongs",
      title: manageSongsOverviewFm("totalSongs"),
    },
    {
      id: "overview-total-playback-count",
      key: "totalPlaybackCount",
      title: manageSongsOverviewFm("totalPlaybackCount"),
      unitFormatFn: formatPlaybackCount,
    },
    {
      id: "overview-total-weighted-playback-duration",
      key: "totalWeightedPlaybackDuration",
      title: manageSongsOverviewFm("totalWeightedPlaybackDuration"),
      unitFormatFn: formatPlaybackDuration,
    },
    {
      id: "overview-average-rating",
      key: "averageRating",
      title: manageSongsOverviewFm("averageRating"),
      unitFormatFn: (rating: number) => `${rating.toFixed(1)}`,
    },
  ];

  return fields;
};
