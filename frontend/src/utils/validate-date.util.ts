export const validateDate = (val: string) => {
  const dateRegex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  const match = dateRegex.exec(val);

  if (!match) return "Please select a valid date";

  const [, year, month, day] = match;

  const date = new Date(val);

  const isValid =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 && // JS month is 0-based, so we need to subtract 1
    date.getDate() === Number(day);

  return isValid || "Please select a valid date";
};
