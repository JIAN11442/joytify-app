export const parseToFloat = (num: number, precision?: number) => {
  return parseFloat(num.toFixed(precision ?? 2));
};
