/* eslint-disable @typescript-eslint/no-explicit-any */

export const timeoutForDelay = (
  callback: (...args: any) => void,
  delay = 0
) => {
  const timeout = setTimeout(() => {
    callback();
  }, delay);

  return () => {
    clearTimeout(timeout);
  };
};

export const timeoutForEventListener = (
  action: string = "click",
  listener: EventListenerOrEventListenerObject,
  delay: number = 0
) => {
  const addEventListener = () => window.addEventListener(action, listener);
  const removeEventListener = () =>
    window.removeEventListener(action, listener);

  const timeout = setTimeout(() => {
    addEventListener();
  }, delay);

  return () => {
    clearTimeout(timeout);
    removeEventListener();
  };
};
