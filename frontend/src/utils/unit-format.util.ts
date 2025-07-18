import { ScopedFormatMessage } from "../hooks/intl.hook";

type FormatPlaybackDurationProps = {
  fm: ScopedFormatMessage;
  duration: number;
  precise?: boolean;
  format?: "colon" | "text";
};

export const formatPlaybackCount = (count: number) => {
  if (count < 1000) return `${count}`;
  if (count < 10000) return `${(count / 1000).toFixed(1)}K`;
  if (count < 100000) return `${(count / 1000).toFixed(0)}K`;
  return `${(count / 10000).toFixed(0)}K`;
};

export const formatPlaybackDuration = ({
  fm,
  duration,
  precise = false,
  format = "colon",
}: FormatPlaybackDurationProps) => {
  const timeUnitFm = fm("time.unit");
  const hoursUnit = timeUnitFm("hours");
  const minutesUnit = timeUnitFm("minutes");
  const secondsUnit = timeUnitFm("seconds");

  if (precise) {
    // precise format
    if (duration >= 3600) {
      // hour:minute format
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);

      if (format === "text") {
        return `${hours} ${hoursUnit} ${minutes} ${minutesUnit}`;
      } else {
        return `${hours}:${minutes.toString().padStart(2, "0")}`;
      }
    } else {
      // minute:second format
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);

      if (format === "text") {
        return `${minutes} ${minutesUnit} ${seconds} ${secondsUnit}`;
      } else {
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      }
    }
  } else {
    if (duration < 60) return `${duration.toFixed(0)} ${secondsUnit}`;
    if (duration < 600) return `${(duration / 60).toFixed(2)} ${minutesUnit}`; // <10 mins
    if (duration < 3600) return `${(duration / 60).toFixed(1)} ${minutesUnit}`; // <1 hour
    if (duration < 36000) return `${(duration / 3600).toFixed(2)} ${hoursUnit}`; // <10 hours
    return `${(duration / 3600).toFixed(1)} ${hoursUnit}`;
  }
};
