export const formatPlaybackCount = (count: number) => {
  if (count < 1000) return `${count}`;
  if (count < 10000) return `${(count / 1000).toFixed(1)}K`;
  if (count < 100000) return `${(count / 1000).toFixed(0)}K`;
  return `${(count / 10000).toFixed(0)}K`;
};

export const formatPlaybackDuration = (
  duration: number,
  precise: boolean = false,
  format: "colon" | "text" = "colon"
) => {
  if (precise) {
    // precise format
    if (duration >= 3600) {
      // hour:minute format
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);

      if (format === "text") {
        return `${hours}h ${minutes}min`;
      } else {
        return `${hours}:${minutes.toString().padStart(2, "0")}`;
      }
    } else {
      // minute:second format
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);

      if (format === "text") {
        return `${minutes}min ${seconds}s`;
      } else {
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      }
    }
  } else {
    if (duration < 60) return `${duration}s`;
    if (duration < 600) return `${(duration / 60).toFixed(2)} min`; // <10 mins
    if (duration < 3600) return `${(duration / 60).toFixed(1)} min`; // <1 hour
    if (duration < 36000) return `${(duration / 3600).toFixed(2)} h`; // <10 hours
    return `${(duration / 3600).toFixed(1)} h`;
  }
};
