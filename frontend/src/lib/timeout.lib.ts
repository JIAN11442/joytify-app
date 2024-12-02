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
  target: Window | Document | HTMLElement,
  action: string = "click",
  listener: EventListenerOrEventListenerObject
) => {
  target.addEventListener(action, listener);

  return () => {
    target.removeEventListener(action, listener);
  };
};
