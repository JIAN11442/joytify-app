/* eslint-disable @typescript-eslint/no-explicit-any */

const getFormData = <T extends object>(
  ref: React.RefObject<HTMLFormElement>
): { formData: T } => {
  // empty object to store form data
  const formData = {} as T;

  try {
    if (ref.current) {
      const form = new FormData(ref.current);

      for (const [key, value] of form.entries()) {
        formData[key as keyof T] = value as T[keyof T];
      }
    }
  } catch (error: any) {
    console.log(`Failed to get form data:\n${error}`);
  }
  return { formData };
};

export default getFormData;
