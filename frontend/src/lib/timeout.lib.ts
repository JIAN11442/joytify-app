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
  listener: EventListenerOrEventListenerObject,
  delay: number = 0
) => {
  const addEventListener = () => target.addEventListener(action, listener);
  const removeEventListener = () =>
    target.removeEventListener(action, listener);

  const timeout = setTimeout(() => {
    addEventListener();
  }, delay);

  return () => {
    clearTimeout(timeout);
    removeEventListener();
  };
};
