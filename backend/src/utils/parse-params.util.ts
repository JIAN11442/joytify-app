const parseParams = (params: string | null | undefined): string | null => {
  if (params === null || params === undefined) {
    return null;
  }

  try {
    const parsed = JSON.parse(params);

    return parsed === null ? null : String(parsed);
  } catch (error) {
    return params;
  }
};

export default parseParams;
