import React, { MutableRefObject } from "react";

/**
 * Sets the value of a ref, whether it's a function ref or an object ref.
 * @param ref - The ref to set.
 * @param value - The value to set the ref to.
 */
const setRef = <T>(ref: React.Ref<T>, value: T | null) => {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    (ref as MutableRefObject<T | null>).current = value;
  }
};

/**
 * Merges two refs into one. This allows both refs to be set to the same DOM element.
 * @param ref1 - The first ref to merge.
 * @param ref2 - The second ref to merge.
 * @returns A callback ref function that sets both refs.
 */
const mergeRefs = <T>(
  ref1: React.Ref<T>,
  ref2: React.Ref<T>
): React.RefCallback<T> => {
  return (node: T | null) => {
    setRef(ref1, node);
    setRef(ref2, node);
  };
};

export default mergeRefs;
