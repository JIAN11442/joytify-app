// check element is editable or not
export const isEditableElement = (element: EventTarget | null): boolean => {
  if (!(element instanceof HTMLElement)) return false;

  const tagName = element.tagName.toLowerCase();

  return (
    tagName === "input" || tagName === "textarea" || element.isContentEditable
  );
};
