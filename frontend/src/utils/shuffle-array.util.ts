/**
 * Implements the Fisher-Yates shuffle algorithm for array randomization.
 *
 * The algorithm works by iterating through the array from end to beginning,
 * and for each position i, swapping the element with a random element from
 * the range [0, i].
 *
 * @template T - The type of elements in the array
 * @param {T[]} arr - The array to be shuffled
 * @returns {T[]} A new array with elements randomly shuffled
 */

export const shuffleArray = <T>(arr: T[]): T[] => {
  if (!Array.isArray(arr)) return arr;

  const newArr = [...arr];
  const n = newArr.length;

  // use a more cryptographically secure random number generator
  const getRandomInt = (max: number) => {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] % max;
  };

  // Fisher-Yates shuffle with improved randomness
  for (let i = n - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }

  return newArr;
};
