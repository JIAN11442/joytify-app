/* eslint-disable @typescript-eslint/no-explicit-any */

export const timeoutForDelay = (callback: (...args: any) => void, delay = 0) => {
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
  signal?: AbortSignal
) => {
  // if signal is aborted, return cleanup function
  if (signal?.aborted) return () => {};

  target.addEventListener(action, listener);

  const cleanup = () => {
    target.removeEventListener(action, listener);
  };

  // if signal is provided, register abort listener
  signal?.addEventListener("abort", cleanup);

  return cleanup;
};
