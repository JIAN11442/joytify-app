const getScrollState = (ref: React.RefObject<HTMLDivElement>) => {
  if (!ref || !ref.current) {
    throw new Error(
      "Invalid ref: The ref is either null or not attached to a DOM element."
    );
  }

  const scrollHeight = ref.current.scrollHeight;
  const clientHeight = ref.current.clientHeight;
  const hasScroll = scrollHeight > clientHeight;

  return hasScroll;
};

export default getScrollState;
