/* eslint-disable @typescript-eslint/no-explicit-any */

export const intervalForDelay = (
  callback: (...args: any) => void,
  delay = 0
) => {
  const interval = setInterval(() => {
    callback();
  }, delay);

  return () => {
    clearInterval(interval);
  };
};
