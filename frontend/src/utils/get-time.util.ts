import moment from "moment";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// const days = [
//   'sunday',
//   'monday',
//   'tuesday',
//   'wednesday',
//   'thursday',
//   'friday',
//   'saturday',
// ];

export const getDay = (timestamp: string) => {
  const date = new Date(timestamp);

  // return `${months[date.getMonth()]} ${date.getDay()}, ${date.getFullYear()}`;
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

export const getFullDay = (timestamp: string) => {
  const date = new Date(timestamp);

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const getTimeAgo = (timestamp: string) => {
  let timeAgo;

  timeAgo = moment(timestamp).fromNow();

  const timeUnit = timeAgo.split(" ")[1];

  if (timeUnit === "month" || timeUnit === "months") {
    timeAgo = getDay(timestamp);
  } else if (timeUnit === "year" || timeUnit === "years") {
    timeAgo = getFullDay(timestamp);
  }

  return timeAgo;
};

export const getDuration = (second: number) => {
  const minute = Math.floor(second / 60);
  const remainingSeconds = Math.floor(second % 60);

  return `${minute}:${
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds
  }`;
};
