export const onYearFromNow = () => {
  return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
};

export const thirtyDaysFormNow = () => {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};

export const fifteenMinutesFromNow = () => {
  return new Date(Date.now() + 15 * 60 * 1000);
};

export const thirtySecondsAgo = () => {
  return new Date(Date.now() - 30 * 1000);
};

export const oneHourFromNow = () => {
  return new Date(Date.now() + 60 * 60 * 1000);
};
